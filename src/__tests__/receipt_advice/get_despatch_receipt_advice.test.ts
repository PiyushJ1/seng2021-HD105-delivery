import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api, DESPATCH_ENDPOINT, VALID_DESPATCH_REQUEST } from "../utils";
import { MongoClient } from "mongodb";

// Ensure these match your actual folder names in /src/app/api/
const RECEIPT_POST_ENDPOINT = "/api/receipt-advice";
const DESPATCH_VIEW_ENDPOINT = "/api/despatch/receipt-advice"; // Changed to singular

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");

beforeEach(async () => {
  await db.collection("receipt_advice").deleteMany({});
  await db.collection("despatch_advice").deleteMany({});
});

afterAll(async () => {
  await client.close();
});

describe("GET /api/despatch/receipt-advice/:receiptAdviceId", () => {
  it("returns 200 and full details with deliveryPartyId in items", async () => {
    const despatchRes = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
    const despatchId = despatchRes.body.despatchAdviceId;

    const receiptReq = {
      despatchId: despatchId,
      deliveryPartyId: "DEL_PARTY_789",
      receivedDate: "2026-03-16",
      items: [{ productId: "prod1", quantityReceived: 5 }],
    };
    
    const setupRes = await api.post(RECEIPT_POST_ENDPOINT).send(receiptReq);
    const receiptAdviceId = setupRes.body.receiptAdviceId;

    const res = await api.get(`${DESPATCH_VIEW_ENDPOINT}/${receiptAdviceId}`);

    expect(res.status).toBe(200);
    expect(res.body.despatchId).toBe(despatchId);
    expect(res.body.items[0]).toHaveProperty("deliveryPartyId", "DEL_PARTY_789");
  });

  it("returns 404 if receipt not found", async () => {
    const res = await api.get(`${DESPATCH_VIEW_ENDPOINT}/NON_EXISTENT`);
    expect(res.status).toBe(404);
  });
});