import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api, DESPATCH_ENDPOINT, VALID_DESPATCH_REQUEST } from "../utils";
import { MongoClient } from "mongodb";

const RECEIPT_POST_ENDPOINT = "/api/receipt-advice";
const PRODUCT_SEARCH_ENDPOINT = "/api/receipt-advices";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");

beforeEach(async () => {
  await db.collection("receipt_advice").deleteMany({});
  await db.collection("despatch_advice").deleteMany({});
});

afterAll(async () => {
  await client.close();
});

describe.skip("GET /api/receipt-advices?productId={productId}", () => {
  it("returns 200 and a list of receipts containing the product", async () => {
    const despatchRes = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
    const despatchId = despatchRes.body.despatchAdviceId;

    const receipt1 = {
      despatchId: despatchId,
      deliveryPartyId: "DEL1",
      receivedDate: "2026-03-01",
      items: [{ productId: "PROD_SEARCH_1", quantityReceived: 50 }]
    };
    const receipt2 = {
      despatchId: despatchId,
      deliveryPartyId: "DEL2",
      receivedDate: "2026-03-02",
      items: [{ productId: "PROD_SEARCH_1", quantityReceived: 30 }]
    };

    await api.post(RECEIPT_POST_ENDPOINT).send(receipt1);
    await api.post(RECEIPT_POST_ENDPOINT).send(receipt2);

    const res = await api.get(`${PRODUCT_SEARCH_ENDPOINT}?productId=PROD_SEARCH_1`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({
      receiptAdviceId: expect.any(String),
      quantityReceived: 50,
      receivedDate: "2026-03-01"
    });
  });

  it("returns 400 if productId parameter is missing", async () => {
    const res = await api.get(PRODUCT_SEARCH_ENDPOINT);
    expect(res.status).toBe(400);
  });

  it("returns 404 if no receipts contain the product", async () => {
    const res = await api.get(`${PRODUCT_SEARCH_ENDPOINT}?productId=GHOST_PRODUCT`);
    expect(res.status).toBe(404);
  });
});