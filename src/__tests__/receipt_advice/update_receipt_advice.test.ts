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

describe.skip("PUT /api/receipt-advice/:receiptAdviceId", () => {
  it("updates receipt advice doc details for a valid request and returns 200", async () => {
    const despatchRes = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
    const despatchId = despatchRes.body.despatchAdviceId;

    const initialReq = {
      despatchId: despatchId,
      deliveryPartyId: "abc123",
      receivedDate: "2026-03-01",
      items: [
        { productId: "prod1", quantityReceived: 10 }
      ],
    };
    const receiptRes = await api.post(RECEIPT_ENDPOINT).send(initialReq);
    const receiptAdviceId = receiptRes.body.receiptAdviceId;

    const updateReq = {
      items: [
        { productId: "prod1", quantityReceived: 10 },
        { productId: "prod2", quantityReceived: 20 }
      ]
    };

    const res = await api.put(`${RECEIPT_ENDPOINT}/${receiptAdviceId}`).send(updateReq);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      receiptAdviceId: receiptAdviceId,
      status: expect.stringMatching(/^(Partial|Complete)$/),
      totalItemsReceived: 30,
    });
  });

  it("returns 400 for invalid update data", async () => {
    const res = await api.put(`${RECEIPT_ENDPOINT}/ANY_ID`).send({
      items: "invalid_format_not_an_array"
    });

    expect(res.status).toBe(400);
  });

  it("returns 404 if receipt advice not found", async () => {
    const updateReq = {
      items: [
        { productId: "prod1", quantityReceived: 80 }
      ]
    };

    const res = await api.put(`${RECEIPT_ENDPOINT}/NON_EXISTENT_ID`).send(updateReq);

    expect(res.status).toBe(404);
  });

  it.todo("returns 403 if not authorised");
});