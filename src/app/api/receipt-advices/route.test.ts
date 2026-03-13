import { NextRequest } from "next/server";

type MongoCursor = { sort: jest.Mock; toArray: jest.Mock };
type MongoCollection = { find: jest.Mock };
type MongoDb = { collection: jest.Mock };

let GET: (req: NextRequest) => Promise<Response>;
let mockedGetAuth: jest.Mock;
let mockCursor: MongoCursor;
let mockCollection: MongoCollection;
let mockDb: MongoDb;

async function setup() {
  jest.resetModules();

  mockCursor = { sort: jest.fn(), toArray: jest.fn() };
  mockCursor.sort.mockReturnValue(mockCursor);
  mockCollection = { find: jest.fn(() => mockCursor) };
  mockDb = { collection: jest.fn(() => mockCollection) };
  const mockClient = { db: jest.fn(() => mockDb) };

  jest.doMock("@/src/lib/mongodb", () => ({
    __esModule: true,
    default: Promise.resolve(mockClient),
  }));

  jest.doMock("@/src/lib/auth", () => ({
    getAuth: jest.fn(),
  }));

  const routeMod = await import("./route");
  GET = routeMod.GET;

  const authMod = await import("@/src/lib/auth");
  mockedGetAuth = authMod.getAuth as unknown as jest.Mock;
}

describe("GET /receipt-advices?productId={productId}", () => {
  beforeEach(async () => {
    await setup();
    jest.clearAllMocks();
  });

  it("returns 400 when productId is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/receipt-advices");

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({
      error: "Missing productId parameter",
    });
    expect(mockedGetAuth).not.toHaveBeenCalled();
  });

  it("returns 403 when user is not authenticated", async () => {
    mockedGetAuth.mockResolvedValue(null);

    const req = new NextRequest(
      "http://localhost:3000/api/receipt-advices?productId=PROD001",
    );

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({
      error: "Not authorised to view",
    });
  });

  it("returns 403 when user is not a despatch party", async () => {
    mockedGetAuth.mockResolvedValue({
      userId: "user-1",
      role: "delivery_party",
      orgId: "DEL001",
    });

    const req = new NextRequest(
      "http://localhost:3000/api/receipt-advices?productId=PROD001",
    );

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({
      error: "Not authorised to view",
    });
  });

  it("returns 404 when no receipt advice matches the productId", async () => {
    mockedGetAuth.mockResolvedValue({
      userId: "user-2",
      role: "despatch_party",
    });

    mockCursor.toArray.mockResolvedValue([]);

    const req = new NextRequest(
      "http://localhost:3000/api/receipt-advices?productId=PROD001",
    );

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({
      error: "No receipt found",
    });

    expect(mockDb.collection).toHaveBeenCalledWith("receiptAdvices");
    expect(mockCollection.find).toHaveBeenCalledWith(
      { "items.productId": "PROD001" },
      {
        projection: {
          _id: 0,
          receiptAdviceId: 1,
          receivedDate: 1,
          items: 1,
        },
      },
    );
    expect(mockCursor.sort).toHaveBeenCalledWith({
      receivedDate: 1,
      receiptAdviceId: 1,
    });
  });

  it("returns 200 and matching receipt advice records for a valid despatch party", async () => {
    mockedGetAuth.mockResolvedValue({
      userId: "user-3",
      role: "despatch_party",
    });

    mockCursor.toArray.mockResolvedValue([
      {
        receiptAdviceId: "REC001",
        receivedDate: new Date("2026-03-01T00:00:00.000Z"),
        items: [
          { productId: "PROD001", quantityReceived: 50 },
          { productId: "PROD002", quantityReceived: 20 },
          { productId: "PROD001", quantityReceived: 30 },
        ],
      },
      {
        receiptAdviceId: "REC002",
        receivedDate: "2026-03-02",
        items: [{ productId: "PROD001", quantityReceived: 40 }],
      },
    ]);

    const req = new NextRequest(
      "http://localhost:3000/api/receipt-advices?productId=PROD001",
    );

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([
      {
        receiptAdviceId: "REC001",
        quantityReceived: 80,
        receivedDate: "2026-03-01",
      },
      {
        receiptAdviceId: "REC002",
        quantityReceived: 40,
        receivedDate: "2026-03-02",
      },
    ]);
  });

  it("returns 500 when the database operation fails", async () => {
    mockedGetAuth.mockResolvedValue({
      userId: "user-4",
      role: "despatch_party",
    });

    mockCursor.toArray.mockRejectedValue(new Error("database failed"));

    const req = new NextRequest(
      "http://localhost:3000/api/receipt-advices?productId=PROD001",
    );

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({
      error: "Internal server error",
    });
  });
});
