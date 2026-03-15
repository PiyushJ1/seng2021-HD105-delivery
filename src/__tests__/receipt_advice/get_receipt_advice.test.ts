import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { 
  api, 
  DESPATCH_ENDPOINT, 
  VALID_DESPATCH_REQUEST 
} from "../utils";
import { MongoClient } from "mongodb";

const RECEIPT_ENDPOINT = "/api/receipt-advice";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");
const receiptCollection = db.collection("receipt_advice");
const despatchCollection = db.collection("despatch_advice");

beforeEach(async () => {
  await receiptCollection.deleteMany({});
  await despatchCollection.deleteMany({});
});

afterAll(async () => {
  await client.close();
});

describe("GET /api/receipt-advice/:receiptAdviceId", () => {
  it("returns 200 and receipt details for a valid receiptAdviceId", async () => {
    const despatchRes = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
    const despatchId = despatchRes.body.despatchAdviceId;

    const receiptReq = {
      despatchId: despatchId,
      deliveryPartyId: "abc123",
      receivedDate: "2026-03-01",
      items: [
        { productId: "prod1", quantityReceived: 10 }
      ],
    };
    
    const setupRes = await api.post(RECEIPT_ENDPOINT).send(receiptReq);
    const receiptAdviceId = setupRes.body.receiptAdviceId;

    const res = await api.get(`${RECEIPT_ENDPOINT}/${receiptAdviceId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      receiptAdviceId: receiptAdviceId,
      deliveryPartyId: "abc123",
      status: "Partial",
      items: [
        { productId: "prod1", quantityReceived: 10 }
      ]
    });
  });

  it("returns 404 if the receipt advice does not exist", async () => {
    const res = await api.get(`${RECEIPT_ENDPOINT}/NON_EXISTENT_ID`);
    expect(res.status).toBe(404);
  });

  it.todo("returns 403 if not authorised to view");
});