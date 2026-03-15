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

describe("POST /api/receipt-advice", () => {
  it("Creates receipt advice successfully", async () => {
    const despatchRes = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
    const despatchId = despatchRes.body.despatchAdviceId;

    const req = {
      despatchId: despatchId,
      deliveryPartyId: "abc123",
      receivedDate: "2026-03-01",
      items: [
        { productId: "prod1", quantityReceived: 10 },
        { productId: "prod2", quantityReceived: 20 },
      ],
    };

    const res = await api.post(RECEIPT_ENDPOINT).send(req);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      receiptAdviceId: expect.any(String),
      status: "Complete",
      totalItemsReceived: 30,
    });
  });

  it("Calculates totalItemsReceived and Partial status correctly", async () => {
    const despatchRes = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
    const despatchId = despatchRes.body.despatchAdviceId;

    const req = {
      despatchId: despatchId,
      deliveryPartyId: "abc123",
      receivedDate: "2026-03-01",
      items: [
        { productId: "prod1", quantityReceived: 5 },
      ],
    };

    const res = await api.post(RECEIPT_ENDPOINT).send(req);

    expect(res.status).toBe(200);
    expect(res.body.totalItemsReceived).toBe(5);
    expect(res.body.status).toBe("Partial");
  });

  it("Returns 400 if fields missing", async () => {
    const req = {
      deliveryPartyId: "abc123",
    };

    const res = await api.post(RECEIPT_ENDPOINT).send(req);

    expect(res.status).toBe(400);
  });

  it("Returns 404 if despatch not found", async () => {
    const req = {
      despatchId: "NON_EXISTENT_DESPATCH_ID",
      deliveryPartyId: "abc123",
      receivedDate: "2026-03-01",
      items: [
        { productId: "prod1", quantityReceived: 10 },
      ],
    };

    const res = await api.post(RECEIPT_ENDPOINT).send(req);

    expect(res.status).toBe(404);
  });

  it("Returns 409 for duplicate receipt advice", async () => {
    const despatchRes = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
    const despatchId = despatchRes.body.despatchAdviceId;

    const req = {
      despatchId: despatchId,
      deliveryPartyId: "abc123",
      receivedDate: "2026-03-01",
      items: [
        { productId: "prod1", quantityReceived: 10 },
      ],
    };

    await api.post(RECEIPT_ENDPOINT).send(req);
    const res = await api.post(RECEIPT_ENDPOINT).send(req);

    expect(res.status).toBe(409);
  });
});