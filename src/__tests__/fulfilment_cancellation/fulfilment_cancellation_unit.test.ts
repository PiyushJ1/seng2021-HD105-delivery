import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

type PostHandler = (req: NextRequest) => Promise<Response>;

const mocks = vi.hoisted(() => {
  const despatchAdvices = {
    findOne: vi.fn(),
  };

  const fulfilmentCancellations = {
    findOne: vi.fn(),
    insertOne: vi.fn(),
  };

  const db = {
    collection: vi.fn((name: string) => {
      if (name === "despatchAdvices") return despatchAdvices;
      if (name === "fulfilmentCancellations") return fulfilmentCancellations;
      throw new Error(`Unexpected collection: ${name}`);
    }),
  };

  const client = {
    db: vi.fn(() => db),
  };

  return {
    despatchAdvices,
    fulfilmentCancellations,
    db,
    client,
  };
});

let POST: PostHandler;
let mockedGetAuth: ReturnType<typeof vi.fn>;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/fulfilment-cancellation", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /fulfilment-cancellation unit", () => {
    beforeEach(async () => {
      vi.resetModules();
      vi.clearAllMocks();
  
      vi.doMock("@/src/lib/mongodb", () => ({
        default: Promise.resolve(mocks.client),
      }));
  
      vi.doMock("@/src/lib/auth", () => ({
        getAuth: vi.fn(),
      }));
  
      const routeModule = await import("../../app/api/fulfilment-cancellation/route");
      POST = routeModule.POST;
  
      const authModule = await import("@/src/lib/auth");
      mockedGetAuth = vi.mocked(authModule.getAuth);
    });
  
    test("returns 403 if user is not authorised", async () => {
      mockedGetAuth.mockResolvedValue(null);
  
      const req = makeRequest({
        despatchAdviceId: "DES2001",
        cancellationDate: "2026-03-01",
        cancelledItems: [{ productId: "prod1", quantityCancelled: 20 }],
      });
  
      const res = await POST(req);
      const body = await res.json();
  
      expect(res.status).toBe(403);
      expect(body).toEqual({
        error: "Not authorized to create fulfilment cancellation document",
      });
    });
  
    test("returns 400 if fields are missing", async () => {
      mockedGetAuth.mockResolvedValue({
        userId: "user-1",
        role: "despatch_party",
      });
  
      const req = makeRequest({
        despatchAdviceId: "DES2001",
      });
  
      const res = await POST(req);
      const body = await res.json();
  
      expect(res.status).toBe(400);
      expect(body).toEqual({
        error: "Invalid or missing fields",
      });
    });
  
    test("returns 404 if despatchAdviceId is not found", async () => {
      mockedGetAuth.mockResolvedValue({
        userId: "user-1",
        role: "despatch_party",
      });
  
      mocks.despatchAdvices.findOne.mockResolvedValue(null);
      mocks.fulfilmentCancellations.findOne.mockResolvedValue(null);
  
      const req = makeRequest({
        despatchAdviceId: "DES404",
        cancellationDate: "2026-03-01",
        cancelledItems: [{ productId: "prod1", quantityCancelled: 20 }],
      });
  
      const res = await POST(req);
      const body = await res.json();
  
      expect(res.status).toBe(404);
      expect(body).toEqual({
        error: "despatchAdviceId not found",
      });
    });
  
    test("returns 409 if fulfilment cancellation already exists", async () => {
      mockedGetAuth.mockResolvedValue({
        userId: "user-1",
        role: "despatch_party",
      });
  
      mocks.despatchAdvices.findOne.mockResolvedValue({
        despatchAdviceId: "DES2001",
        items: [{ productId: "prod1", quantityDespatched: 50 }],
      });
  
      mocks.fulfilmentCancellations.findOne.mockResolvedValue({
        fulfilmentCancellationId: "FC001",
        despatchAdviceId: "DES2001",
        status: "Created",
      });
  
      const req = makeRequest({
        despatchAdviceId: "DES2001",
        cancellationDate: "2026-03-01",
        cancelledItems: [{ productId: "prod1", quantityCancelled: 20 }],
      });
  
      const res = await POST(req);
      const body = await res.json();
  
      expect(res.status).toBe(409);
      expect(body).toEqual({
        error:
          "Fulfilment cancellation document already exists for this despatchAdviceId",
      });
    });
  
    test("returns 422 if productId is not in despatch advice", async () => {
      mockedGetAuth.mockResolvedValue({
        userId: "user-1",
        role: "despatch_party",
      });
  
      mocks.despatchAdvices.findOne.mockResolvedValue({
        despatchAdviceId: "DES2001",
        items: [{ productId: "prod1", quantityDespatched: 50 }],
      });
  
      mocks.fulfilmentCancellations.findOne.mockResolvedValue(null);
  
      const req = makeRequest({
        despatchAdviceId: "DES2001",
        cancellationDate: "2026-03-01",
        cancelledItems: [{ productId: "prod999", quantityCancelled: 10 }],
      });
  
      const res = await POST(req);
      const body = await res.json();
  
      expect(res.status).toBe(422);
      expect(body).toEqual({
        error: "productId not in despatch advice: prod999",
      });
    });
  
    test("returns 422 if quantityCancelled exceeds quantity despatched", async () => {
      mockedGetAuth.mockResolvedValue({
        userId: "user-1",
        role: "despatch_party",
      });
  
      mocks.despatchAdvices.findOne.mockResolvedValue({
        despatchAdviceId: "DES2001",
        items: [{ productId: "prod1", quantityDespatched: 50 }],
      });
  
      mocks.fulfilmentCancellations.findOne.mockResolvedValue(null);
  
      const req = makeRequest({
        despatchAdviceId: "DES2001",
        cancellationDate: "2026-03-01",
        cancelledItems: [{ productId: "prod1", quantityCancelled: 60 }],
      });
  
      const res = await POST(req);
      const body = await res.json();
  
      expect(res.status).toBe(422);
      expect(body).toEqual({
        error: "quantityCancelled exceeds quantity despatched for productId: prod1",
      });
    });
  
    test("creates fulfilment cancellation successfully", async () => {
      mockedGetAuth.mockResolvedValue({
        userId: "user-1",
        role: "despatch_party",
      });
  
      mocks.despatchAdvices.findOne.mockResolvedValue({
        despatchAdviceId: "DES2001",
        items: [
          { productId: "prod1", quantityDespatched: 50 },
          { productId: "prod2", quantityDespatched: 20 },
        ],
      });
  
      mocks.fulfilmentCancellations.findOne.mockResolvedValue(null);
      mocks.fulfilmentCancellations.insertOne.mockResolvedValue({
        acknowledged: true,
        insertedId: "mock-id",
      });
  
      const req = makeRequest({
        despatchAdviceId: "DES2001",
        reason: "damaged goods in transit",
        cancellationDate: "2026-03-01",
        cancelledItems: [
          {
            productId: "prod1",
            quantityCancelled: 20,
            reasonCode: "DAMAGED",
          },
          {
            productId: "prod2",
            quantityCancelled: 10,
            reasonCode: "CUSTOMER_REQUEST",
          },
        ],
      });
  
      const res = await POST(req);
      const body = await res.json();
  
      expect(res.status).toBe(200);
      expect(body).toEqual({
        fulfilmentCancellationId: expect.any(String),
        status: "Created",
        despatchAdviceId: "DES2001",
      });
    });
  });