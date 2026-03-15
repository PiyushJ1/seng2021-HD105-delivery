import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { GET } from "../../app/api/fulfilment-cancellations/[fulfilmentCancellationId]/route";

const { mockFindOne, mockGetAuth } = vi.hoisted(() => ({
  mockFindOne: vi.fn(),
  mockGetAuth: vi.fn(),
}));

vi.mock("@/src/lib/mongodb", () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: mockFindOne,
      }),
    }),
  }),
}));

vi.mock("@/src/lib/auth", () => ({
  getAuth: mockGetAuth,
}));

function getRequest(
  fulfilmentCancellationId: string,
  auth = true,
) {
  return new NextRequest(
    `http://localhost/api/fulfilment-cancellations/${encodeURIComponent(fulfilmentCancellationId)}`,
    {
      method: "GET",
      headers: auth ? { Authorization: "Bearer x" } : {},
    },
  );
}

describe("GET /fulfilment-cancellations/{fulfilmentCancellationId} (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuth.mockResolvedValue({ role: "despatch_party", orgId: "SUP1" });
    mockFindOne.mockImplementation((q: Record<string, unknown>) => {
      if (q.fulfilmentCancellationId === "FC001") {
        return Promise.resolve({
          fulfilmentCancellationId: "FC001",
          despatchAdviceId: "DA001",
          status: "Created",
          cancellationDate: "2026-03-02",
          cancelledItems: [
            {
              productId: "prod1",
              quantityCancelled: 100,
              reasonCode: "DAMAGED",
            },
          ],
          reason: "Carrier reported damaged shipment",
        });
      }
      if (q.despatchAdviceId === "DA001") {
        return Promise.resolve({
          despatchAdviceId: "DA001",
          supplierPartyId: "abc123",
          deliveryPartyId: "abc123",
        });
      }
      return Promise.resolve(null);
    });
  });

  test("Returns 403 when not authenticated", async () => {
    mockGetAuth.mockResolvedValue(null);
    const req = getRequest("FC001");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "FC001" }),
    });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "Not authorised to access this fulfilment cancellation document",
    });
  });

  test("Returns 400 when fulfilmentCancellationId format is invalid (whitespace)", async () => {
    const req = getRequest("  ");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "  " }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Invalid fulfilmentCancellationId format",
    });
  });

  test("Returns 400 when fulfilmentCancellationId is empty string", async () => {
    const req = getRequest("");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "" }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Invalid fulfilmentCancellationId format",
    });
  });

  test("Returns 404 when document not found", async () => {
    mockFindOne.mockImplementation((q: Record<string, unknown>) => {
      if (q.fulfilmentCancellationId === "FC404") return Promise.resolve(null);
      if (q.despatchAdviceId) return Promise.resolve(null);
      return Promise.resolve(null);
    });
    const req = getRequest("FC404");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "FC404" }),
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "Fulfilment cancellation document not found",
    });
  });

  test("Returns 403 when delivery_party and orgId does not match deliveryPartyId", async () => {
    mockGetAuth.mockResolvedValue({
      role: "delivery_party",
      orgId: "OTHER",
    });
    mockFindOne.mockImplementation((q: Record<string, unknown>) => {
      if (q.fulfilmentCancellationId === "FC001") {
        return Promise.resolve({
          fulfilmentCancellationId: "FC001",
          despatchAdviceId: "DA001",
          status: "Created",
          cancellationDate: "2026-03-02",
          cancelledItems: [{ productId: "prod1", quantityCancelled: 100 }],
          reason: "Damaged",
        });
      }
      if (q.despatchAdviceId === "DA001") {
        return Promise.resolve({
          despatchAdviceId: "DA001",
          supplierPartyId: "abc123",
          deliveryPartyId: "abc123",
        });
      }
      return Promise.resolve(null);
    });
    const req = getRequest("FC001");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "FC001" }),
    });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "Not authorised to access this fulfilment cancellation document",
    });
  });

  test("Returns 200 with full response when authorised", async () => {
    const req = getRequest("FC001");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "FC001" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      fulfilmentCancellationId: "FC001",
      despatchAdviceId: "DA001",
      supplierPartyId: "abc123",
      deliveryPartyId: "abc123",
      cancellationDate: "2026-03-02",
      cancellationReason: "Carrier reported damaged shipment",
      status: "Created",
      cancelledItems: [
        {
          productId: "prod1",
          quantityCancelled: 100,
          reasonCode: "DAMAGED",
        },
      ],
    });
  });

  test("Returns 200 when delivery_party orgId matches deliveryPartyId", async () => {
    mockGetAuth.mockResolvedValue({
      role: "delivery_party",
      orgId: "abc123",
    });
    const req = getRequest("FC001");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "FC001" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.fulfilmentCancellationId).toBe("FC001");
    expect(body.deliveryPartyId).toBe("abc123");
  });

  test("Returns 200 when doc has supplierPartyId and deliveryPartyId on FC document (no DA lookup needed)", async () => {
    mockFindOne.mockImplementation((q: Record<string, unknown>) => {
      if (q.fulfilmentCancellationId === "FC-DOC-ONLY") {
        return Promise.resolve({
          fulfilmentCancellationId: "FC-DOC-ONLY",
          despatchAdviceId: "DA999",
          status: "Sent",
          cancellationDate: "2026-03-04",
          cancelledItems: [{ productId: "p1", quantityCancelled: 5 }],
          reason: "Doc-only reason",
          supplierPartyId: "supplier-on-doc",
          deliveryPartyId: "delivery-on-doc",
        });
      }
      if (q.despatchAdviceId === "DA999") return Promise.resolve(null);
      return Promise.resolve(null);
    });
    const req = getRequest("FC-DOC-ONLY");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "FC-DOC-ONLY" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.supplierPartyId).toBe("supplier-on-doc");
    expect(body.deliveryPartyId).toBe("delivery-on-doc");
    expect(body.cancellationReason).toBe("Doc-only reason");
  });

  test("Returns 200 with empty cancelledItems array", async () => {
    mockFindOne.mockImplementation((q: Record<string, unknown>) => {
      if (q.fulfilmentCancellationId === "FC-EMPTY-ITEMS") {
        return Promise.resolve({
          fulfilmentCancellationId: "FC-EMPTY-ITEMS",
          despatchAdviceId: "DA001",
          status: "Created",
          cancellationDate: "2026-03-02",
          cancelledItems: [],
          reason: "No items",
        });
      }
      if (q.despatchAdviceId === "DA001") {
        return Promise.resolve({
          despatchAdviceId: "DA001",
          supplierPartyId: "s1",
          deliveryPartyId: "d1",
        });
      }
      return Promise.resolve(null);
    });
    const req = getRequest("FC-EMPTY-ITEMS");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "FC-EMPTY-ITEMS" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cancelledItems).toEqual([]);
    expect(body.fulfilmentCancellationId).toBe("FC-EMPTY-ITEMS");
  });

  test("Returns 200 with multiple cancelledItems (mix of reasonCode present and absent)", async () => {
    mockFindOne.mockImplementation((q: Record<string, unknown>) => {
      if (q.fulfilmentCancellationId === "FC-MULTI") {
        return Promise.resolve({
          fulfilmentCancellationId: "FC-MULTI",
          despatchAdviceId: "DA001",
          status: "Created",
          cancellationDate: "2026-03-02",
          cancelledItems: [
            { productId: "p1", quantityCancelled: 10, reasonCode: "DAMAGED" },
            { productId: "p2", quantityCancelled: 20 },
            { productId: "p3", quantityCancelled: 5, reasonCode: "CUSTOMER_REQUEST" },
          ],
          reason: "Multiple items",
        });
      }
      if (q.despatchAdviceId === "DA001") {
        return Promise.resolve({
          despatchAdviceId: "DA001",
          supplierPartyId: "s1",
          deliveryPartyId: "d1",
        });
      }
      return Promise.resolve(null);
    });
    const req = getRequest("FC-MULTI");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "FC-MULTI" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cancelledItems).toHaveLength(3);
    expect(body.cancelledItems[0]).toEqual({ productId: "p1", quantityCancelled: 10, reasonCode: "DAMAGED" });
    expect(body.cancelledItems[1]).toEqual({ productId: "p2", quantityCancelled: 20 });
    expect(body.cancelledItems[1]).not.toHaveProperty("reasonCode");
    expect(body.cancelledItems[2]).toEqual({ productId: "p3", quantityCancelled: 5, reasonCode: "CUSTOMER_REQUEST" });
  });

  test("Returns 200 when despatch advice not found (supplier/delivery from doc or empty)", async () => {
    mockFindOne.mockImplementation((q: Record<string, unknown>) => {
      if (q.fulfilmentCancellationId === "FC-NO-DA") {
        return Promise.resolve({
          fulfilmentCancellationId: "FC-NO-DA",
          despatchAdviceId: "DA-MISSING",
          status: "Created",
          cancellationDate: "2026-03-02",
          cancelledItems: [{ productId: "p1", quantityCancelled: 1 }],
          reason: "No DA",
        });
      }
      if (q.despatchAdviceId === "DA-MISSING") return Promise.resolve(null);
      return Promise.resolve(null);
    });
    const req = getRequest("FC-NO-DA");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "FC-NO-DA" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.supplierPartyId).toBe("");
    expect(body.deliveryPartyId).toBe("");
    expect(body.fulfilmentCancellationId).toBe("FC-NO-DA");
  });

  test("Returns 200 with cancelledItems omitting optional reasonCode when absent", async () => {
    mockFindOne.mockImplementation((q: Record<string, unknown>) => {
      if (q.fulfilmentCancellationId === "FC002") {
        return Promise.resolve({
          fulfilmentCancellationId: "FC002",
          despatchAdviceId: "DA001",
          status: "Sent",
          cancellationDate: "2026-03-03",
          cancelledItems: [
            { productId: "prod2", quantityCancelled: 50 },
          ],
          reason: "Customer request",
        });
      }
      if (q.despatchAdviceId === "DA001") {
        return Promise.resolve({
          despatchAdviceId: "DA001",
          supplierPartyId: "abc123",
          deliveryPartyId: "abc123",
        });
      }
      return Promise.resolve(null);
    });
    const req = getRequest("FC002");
    const res = await GET(req, {
      params: Promise.resolve({ fulfilmentCancellationId: "FC002" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cancelledItems).toHaveLength(1);
    expect(body.cancelledItems[0]).toEqual({
      productId: "prod2",
      quantityCancelled: 50,
    });
    expect(body.cancelledItems[0]).not.toHaveProperty("reasonCode");
  });
});
