import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { POST } from "../../app/api/fulfilment-cancellation/route";

const { mockFindOne, mockInsertOne, mockGetAuth } = vi.hoisted(() => ({
  mockFindOne: vi.fn(),
  mockInsertOne: vi.fn(),
  mockGetAuth: vi.fn(),
}));

vi.mock("@/src/lib/mongodb", () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: mockFindOne,
        insertOne: mockInsertOne,
      }),
    }),
  }),
}));
vi.mock("@/src/lib/auth", () => ({
  getAuth: mockGetAuth,
}));

function jsonRequest(body: unknown, url = "http://localhost/api/fulfilment-cancellation") {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /fulfilment-cancellation (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuth.mockResolvedValue({ role: "despatch_party" });
  });

  test("Returns 403 if user is not despatch_party", async () => {
    mockGetAuth.mockResolvedValue(null);
    const req = jsonRequest({
      despatchAdviceId: "DES2001",
      cancellationDate: "2026-03-01",
      cancelledItems: [{ productId: "prod1", quantityCancelled: 10 }],
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "Not authorized to create fulfilment cancellation document",
    });
  });

  test("Returns 403 if role is delivery_party", async () => {
    mockGetAuth.mockResolvedValue({ role: "delivery_party", orgId: "DEL001" });
    const req = jsonRequest({
      despatchAdviceId: "DES2001",
      cancellationDate: "2026-03-01",
      cancelledItems: [{ productId: "prod1", quantityCancelled: 10 }],
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  test("Returns 400 if body is invalid JSON", async () => {
    const req = new NextRequest("http://localhost/api/fulfilment-cancellation", {
      method: "POST",
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid or missing fields" });
  });

  test("Returns 400 if required fields are missing", async () => {
    const req = jsonRequest({ despatchAdviceId: "DES2001" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid or missing fields" });
  });

  test("Returns 400 if cancellationDate is invalid format", async () => {
    const req = jsonRequest({
      despatchAdviceId: "DES2001",
      cancellationDate: "01-03-2026",
      cancelledItems: [{ productId: "prod1", quantityCancelled: 20 }],
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid or missing fields" });
  });

  test("Returns 400 if cancelledItems has invalid line", async () => {
    const req = jsonRequest({
      despatchAdviceId: "DES2001",
      cancellationDate: "2026-03-01",
      cancelledItems: [{ productId: "", quantityCancelled: 10 }],
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid or missing fields" });
  });

  test("Returns 404 if despatchAdviceId not found", async () => {
    mockFindOne.mockImplementation((filter: { despatchAdviceId?: string }) => {
      if (filter.despatchAdviceId === "DES2001") return null;
      return null;
    });
    const req = jsonRequest({
      despatchAdviceId: "DES2001",
      cancellationDate: "2026-03-01",
      cancelledItems: [{ productId: "prod1", quantityCancelled: 10 }],
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "despatchAdviceId not found" });
  });

  test("Returns 409 if fulfilment cancellation already exists", async () => {
    mockFindOne
      .mockResolvedValueOnce({
        despatchAdviceId: "DES2001",
        items: [{ productId: "prod1", quantityDespatched: 50 }],
      })
      .mockResolvedValueOnce({ fulfilmentCancellationId: "FC001" });
    const req = jsonRequest({
      despatchAdviceId: "DES2001",
      cancellationDate: "2026-03-01",
      cancelledItems: [{ productId: "prod1", quantityCancelled: 10 }],
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      error: "Fulfilment cancellation document already exists for this despatchAdviceId",
    });
  });

  test("Returns 422 if productId not in despatch advice", async () => {
    mockFindOne.mockResolvedValueOnce({
      despatchAdviceId: "DES2001",
      items: [{ productId: "prod1", quantityDespatched: 50 }],
    }).mockResolvedValueOnce(null);
    const req = jsonRequest({
      despatchAdviceId: "DES2001",
      cancellationDate: "2026-03-01",
      cancelledItems: [{ productId: "prod999", quantityCancelled: 10 }],
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: "productId not in despatch advice: prod999",
    });
  });

  test("Returns 422 if quantityCancelled exceeds quantity despatched", async () => {
    mockFindOne.mockResolvedValueOnce({
      despatchAdviceId: "DES2001",
      items: [{ productId: "prod1", quantityDespatched: 50 }],
    }).mockResolvedValueOnce(null);
    const req = jsonRequest({
      despatchAdviceId: "DES2001",
      cancellationDate: "2026-03-01",
      cancelledItems: [{ productId: "prod1", quantityCancelled: 60 }],
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: "quantityCancelled exceeds quantity despatched for productId: prod1",
    });
  });

  test("Returns 422 when summed duplicate productIds exceed despatched", async () => {
    mockFindOne.mockResolvedValueOnce({
      despatchAdviceId: "DES2001",
      items: [{ productId: "prod1", quantityDespatched: 25 }],
    }).mockResolvedValueOnce(null);
    const req = jsonRequest({
      despatchAdviceId: "DES2001",
      cancellationDate: "2026-03-01",
      cancelledItems: [
        { productId: "prod1", quantityCancelled: 20 },
        { productId: "prod1", quantityCancelled: 10 },
      ],
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: "quantityCancelled exceeds quantity despatched for productId: prod1",
    });
  });

  test("Creates fulfilment cancellation successfully", async () => {
    mockFindOne
      .mockResolvedValueOnce({
        despatchAdviceId: "DES2001",
        items: [
          { productId: "prod1", quantityDespatched: 50 },
          { productId: "prod2", quantityDespatched: 20 },
        ],
      })
      .mockResolvedValueOnce(null);
    mockInsertOne.mockResolvedValue(undefined);

    const req = jsonRequest({
      despatchAdviceId: "DES2001",
      reason: "damaged goods in transit",
      cancellationDate: "2026-03-01",
      cancelledItems: [
        { productId: "prod1", quantityCancelled: 20, reasonCode: "DAMAGED" },
        { productId: "prod2", quantityCancelled: 10, reasonCode: "CUSTOMER_REQUEST" },
      ],
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.fulfilmentCancellationId).toBeDefined();
    expect(data.status).toBe("Created");
    expect(data.despatchAdviceId).toBe("DES2001");
    expect(mockInsertOne).toHaveBeenCalledOnce();
  });
});