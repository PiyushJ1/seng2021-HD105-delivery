import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { SignJWT } from "jose";
import { MongoClient } from "mongodb";
import request from "supertest";

const api = request("http://localhost:3000");
const FULFILMENT_CANCELLATIONS_ENDPOINT = "/api/fulfilment-cancellations";

const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const hasEnv = Boolean(mongoUri && jwtSecret);

let client: MongoClient | null = null;

async function createTestToken(role: "delivery_party" | "despatch_party", orgId?: string): Promise<string> {
  const secret = new TextEncoder().encode(jwtSecret);
  return new SignJWT({ role, orgId: orgId ?? "" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("test-user")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

describe("GET /fulfilment-cancellations/:fulfilmentCancellationId (integration)", () => {
  beforeAll(async () => {
    if (!hasEnv) return;
    client = new MongoClient(mongoUri!);
    await client.connect();
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it("returns 403 when not authenticated", async () => {
    if (!hasEnv) return;
    const res = await api.get(`${FULFILMENT_CANCELLATIONS_ENDPOINT}/FC001`);
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      error: "Not authorised to access this fulfilment cancellation document",
    });
  });

  it("returns 400 when fulfilmentCancellationId format is invalid", async () => {
    if (!hasEnv) return;
    const token = await createTestToken("despatch_party");
    const res = await api
      .get(`${FULFILMENT_CANCELLATIONS_ENDPOINT}/%20%20`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: "Invalid fulfilmentCancellationId format",
    });
  });

  it("returns 404 when document not found", async () => {
    if (!hasEnv) return;
    const token = await createTestToken("despatch_party");
    const res = await api
      .get(`${FULFILMENT_CANCELLATIONS_ENDPOINT}/nonexistent-id-404`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: "Fulfilment cancellation document not found",
    });
  });

  it("returns 200 with full response when document exists and user is authorised", async () => {
    if (!mongoUri || !jwtSecret || !client) return;

    const db = client.db();
    const fulfilmentCancellations = db.collection("fulfilmentCancellations");
    const despatchAdvices = db.collection("despatchAdvices");

    const testId = "FC-INT-TEST-" + Date.now();
    await despatchAdvices.insertOne({
      despatchAdviceId: "DA-INT-TEST",
      supplierPartyId: "supplier1",
      deliveryPartyId: "delivery1",
    });
    await fulfilmentCancellations.insertOne({
      fulfilmentCancellationId: testId,
      despatchAdviceId: "DA-INT-TEST",
      status: "Created",
      cancellationDate: "2026-03-02",
      cancelledItems: [
        { productId: "prod1", quantityCancelled: 10, reasonCode: "DAMAGED" },
      ],
      reason: "Test reason",
    });

    try {
      const token = await createTestToken("despatch_party", "supplier1");
      const res = await api
        .get(`${FULFILMENT_CANCELLATIONS_ENDPOINT}/${encodeURIComponent(testId)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        fulfilmentCancellationId: testId,
        despatchAdviceId: "DA-INT-TEST",
        supplierPartyId: "supplier1",
        deliveryPartyId: "delivery1",
        cancellationDate: "2026-03-02",
        cancellationReason: "Test reason",
        status: "Created",
        cancelledItems: [
          {
            productId: "prod1",
            quantityCancelled: 10,
            reasonCode: "DAMAGED",
          },
        ],
      });
    } finally {
      await fulfilmentCancellations.deleteOne({ fulfilmentCancellationId: testId });
      await despatchAdvices.deleteOne({ despatchAdviceId: "DA-INT-TEST" });
    }
  });

  it("returns 403 when delivery_party orgId does not match document deliveryPartyId", async () => {
    if (!mongoUri || !jwtSecret || !client) return;

    const db = client.db();
    const fulfilmentCancellations = db.collection("fulfilmentCancellations");
    const despatchAdvices = db.collection("despatchAdvices");

    const testId = "FC-INT-FORBIDDEN-" + Date.now();
    await despatchAdvices.insertOne({
      despatchAdviceId: "DA-FORBIDDEN",
      supplierPartyId: "supplier1",
      deliveryPartyId: "delivery1",
    });
    await fulfilmentCancellations.insertOne({
      fulfilmentCancellationId: testId,
      despatchAdviceId: "DA-FORBIDDEN",
      status: "Created",
      cancellationDate: "2026-03-02",
      cancelledItems: [{ productId: "p1", quantityCancelled: 1 }],
      reason: "Test",
    });

    try {
      const token = await createTestToken("delivery_party", "other-org");
      const res = await api
        .get(`${FULFILMENT_CANCELLATIONS_ENDPOINT}/${encodeURIComponent(testId)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        error: "Not authorised to access this fulfilment cancellation document",
      });
    } finally {
      await fulfilmentCancellations.deleteOne({ fulfilmentCancellationId: testId });
      await despatchAdvices.deleteOne({ despatchAdviceId: "DA-FORBIDDEN" });
    }
  });

  it("returns 200 with empty cancelledItems when document has no items", async () => {
    if (!mongoUri || !jwtSecret || !client) return;

    const db = client.db();
    const fulfilmentCancellations = db.collection("fulfilmentCancellations");
    const despatchAdvices = db.collection("despatchAdvices");

    const testId = "FC-INT-EMPTY-ITEMS-" + Date.now();
    await despatchAdvices.insertOne({
      despatchAdviceId: "DA-EMPTY",
      supplierPartyId: "s1",
      deliveryPartyId: "d1",
    });
    await fulfilmentCancellations.insertOne({
      fulfilmentCancellationId: testId,
      despatchAdviceId: "DA-EMPTY",
      status: "Created",
      cancellationDate: "2026-03-05",
      cancelledItems: [],
      reason: "No items cancelled",
    });

    try {
      const token = await createTestToken("despatch_party");
      const res = await api
        .get(`${FULFILMENT_CANCELLATIONS_ENDPOINT}/${encodeURIComponent(testId)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.cancelledItems).toEqual([]);
      expect(res.body.fulfilmentCancellationId).toBe(testId);
      expect(res.body.cancellationReason).toBe("No items cancelled");
    } finally {
      await fulfilmentCancellations.deleteOne({ fulfilmentCancellationId: testId });
      await despatchAdvices.deleteOne({ despatchAdviceId: "DA-EMPTY" });
    }
  });

  it("returns 200 with multiple cancelledItems and correct response shape", async () => {
    if (!mongoUri || !jwtSecret || !client) return;

    const db = client.db();
    const fulfilmentCancellations = db.collection("fulfilmentCancellations");
    const despatchAdvices = db.collection("despatchAdvices");

    const testId = "FC-INT-MULTI-" + Date.now();
    await despatchAdvices.insertOne({
      despatchAdviceId: "DA-MULTI",
      supplierPartyId: "sup",
      deliveryPartyId: "del",
    });
    await fulfilmentCancellations.insertOne({
      fulfilmentCancellationId: testId,
      despatchAdviceId: "DA-MULTI",
      status: "Sent",
      cancellationDate: "2026-03-06",
      cancelledItems: [
        { productId: "prod-a", quantityCancelled: 1, reasonCode: "DAMAGED" },
        { productId: "prod-b", quantityCancelled: 2 },
      ],
      reason: "Multi-item cancellation",
    });

    try {
      const token = await createTestToken("delivery_party", "del");
      const res = await api
        .get(`${FULFILMENT_CANCELLATIONS_ENDPOINT}/${encodeURIComponent(testId)}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.fulfilmentCancellationId).toBe(testId);
      expect(res.body.despatchAdviceId).toBe("DA-MULTI");
      expect(res.body.supplierPartyId).toBe("sup");
      expect(res.body.deliveryPartyId).toBe("del");
      expect(res.body.status).toBe("Sent");
      expect(res.body.cancelledItems).toHaveLength(2);
      expect(res.body.cancelledItems[0]).toEqual({ productId: "prod-a", quantityCancelled: 1, reasonCode: "DAMAGED" });
      expect(res.body.cancelledItems[1]).toMatchObject({ productId: "prod-b", quantityCancelled: 2 });
      expect(res.body.cancelledItems[1]).not.toHaveProperty("reasonCode");
    } finally {
      await fulfilmentCancellations.deleteOne({ fulfilmentCancellationId: testId });
      await despatchAdvices.deleteOne({ despatchAdviceId: "DA-MULTI" });
    }
  });
});
