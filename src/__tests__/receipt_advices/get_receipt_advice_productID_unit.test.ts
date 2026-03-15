import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { GET } from "../../app/api/receipt-advices/route";

const { mockToArray, mockSort, mockFind, mockGetAuth } = vi.hoisted(() => {
  const mockToArray = vi.fn();
  const mockSort = vi.fn(() => ({
    toArray: mockToArray,
  }));
  const mockFind = vi.fn(() => ({
    sort: mockSort,
  }));
  return {
    mockToArray,
    mockSort,
    mockFind,
    mockGetAuth: vi.fn(),
  };
});

vi.mock("@/src/lib/mongodb", () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        find: mockFind,
      }),
    }),
  }),
}));

vi.mock("@/src/lib/auth", () => ({
  getAuth: mockGetAuth,
}));

function makeRequest(url: string) {
  return new NextRequest(url, { method: "GET" });
}

describe("GET /receipt-advices?productId={productId} (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuth.mockResolvedValue({ role: "despatch_party" });
    mockSort.mockReturnValue({ toArray: mockToArray });
    mockFind.mockReturnValue({ sort: mockSort });
  });

  test("Returns 400 if productId is missing", async () => {
    const req = makeRequest("http://localhost/api/receipt-advices");

    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Missing productId parameter",
    });
    expect(mockGetAuth).not.toHaveBeenCalled();
  });

  test("Returns 403 if user is not authorised", async () => {
    mockGetAuth.mockResolvedValue(null);

    const req = makeRequest(
      "http://localhost/api/receipt-advices?productId=PROD001",
    );

    const res = await GET(req);

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "Not authorised to view",
    });
  });

  test("Returns 403 if role is delivery_party", async () => {
    mockGetAuth.mockResolvedValue({
      role: "delivery_party",
      orgId: "DEL001",
    });

    const req = makeRequest(
      "http://localhost/api/receipt-advices?productId=PROD001",
    );

    const res = await GET(req);

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "Not authorised to view",
    });
  });

  test("Returns 404 if no receipt advice matches the productId", async () => {
    mockToArray.mockResolvedValue([]);

    const req = makeRequest(
      "http://localhost/api/receipt-advices?productId=PROD001",
    );

    const res = await GET(req);

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "No receipt found",
    });

    expect(mockFind).toHaveBeenCalledWith(
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

    expect(mockSort).toHaveBeenCalledWith({
      receivedDate: 1,
      receiptAdviceId: 1,
    });
  });

  test("Returns 404 if matched documents sum to zero quantity", async () => {
    mockToArray.mockResolvedValue([
      {
        receiptAdviceId: "REC001",
        receivedDate: "2026-03-01",
        items: [{ productId: "PROD001", quantityReceived: 0 }],
      },
    ]);

    const req = makeRequest(
      "http://localhost/api/receipt-advices?productId=PROD001",
    );

    const res = await GET(req);

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "No receipt found",
    });
  });

  test("Returns 200 with matching receipt advice records", async () => {
    mockToArray.mockResolvedValue([
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

    const req = makeRequest(
      "http://localhost/api/receipt-advices?productId=PROD001",
    );

    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
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
});
