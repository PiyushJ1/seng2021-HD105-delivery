import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { 
  api, 
  DESPATCH_ENDPOINT, 
  VALID_DESPATCH_REQUEST 
} from "../utils";
import { MongoClient } from "mongodb";

const RECEIPT_POST_ENDPOINT = "/api/receipt-advice";
const DESPATCH_VIEW_ENDPOINT = "/api/despatch/receipt-advices";

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

describe.skip("GET /api/despatch/receipt-advices/:receiptAdviceId", () => {
  it("returns 200 and full details with flattened deliveryPartyId in items", async () => {
    const despatchRes = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
    const despatchId = despatchRes.body.despatchAdviceId;

    const deliveryId = "DEL_PARTY_789";
    const receiptReq = {
      despatchId: despatchId,
      deliveryPartyId: deliveryId,
      receivedDate: "2026-03-16",
      items: [
        { productId: "prod1", quantityReceived: 5 },
        { productId: "prod2", quantityReceived: 10 }
      ],
    };
    
    const setupRes = await api.post(RECEIPT_POST_ENDPOINT).send(receiptReq);
    const receiptAdviceId = setupRes.body.receiptAdviceId;

    const res = await api.get(`${DESPATCH_VIEW_ENDPOINT}/${receiptAdviceId}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      receiptAdviceId: receiptAdviceId,
      despatchId: despatchId,
      status: expect.stringMatching(/^(Partial|Complete)$/),
      items: expect.arrayContaining([
        expect.objectContaining({
          productId: "prod1",
          deliveryPartyId: deliveryId,
          quantityReceived: 5
        }),
        expect.objectContaining({
          productId: "prod2",
          deliveryPartyId: deliveryId,
          quantityReceived: 10
        })
      ])
    });
  });

  it("returns 404 if receipt advice does not exist", async () => {
    const res = await api.get(`${DESPATCH_VIEW_ENDPOINT}/NON_EXISTENT_ID`);
    expect(res.status).toBe(404);
  });

  it.todo("returns 403 if not authorised to view full details");
});