import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api } from "../utils";
import { MongoClient } from "mongodb";

const BASE_URL = "/api/fulfilment-cancellation";
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");

beforeEach(async () => {
  await db.collection("despatchAdvices").deleteMany({});
  await db.collection("fulfilmentCancellations").deleteMany({});
});

afterAll(async () => {
  await client.close();
});

describe("GET /api/fulfilment-cancellation/[fulfilmentCancelationId]", () => {
  it("returns 400 when the ID is whitespace or empty", async () => {
    const res = await api.get(`${BASE_URL}/%20%20`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid fulfilmentCancellationId format");
  });

  it("returns 404 when the fulfilment cancellation does not exist", async () => {
    const res = await api.get(`${BASE_URL}/FC_DOES_NOT_EXIST`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Fulfilment cancellation document not found");
  });

  it("returns 200 and correctly maps document fields", async () => {
    const uniqueId = "FC_101";
    
    await db.collection("despatchAdvices").insertOne({
      despatchAdviceId: "DA_SUCCESS",
      supplierPartyId: "SUPP_1",
      deliveryPartyId: "DELIV_1"
    });

    await db.collection("fulfilmentCancellations").insertOne({
      fulfilmentCancellationId: uniqueId,
      despatchAdviceId: "DA_SUCCESS",
      status: "Created",
      cancellationDate: "2026-03-16",
      reason: "Goods damaged during loading",
      cancelledItems: [
        { productId: "p1", quantityCancelled: 10, reasonCode: "DAMAGED" },
        { productId: "p2", quantityCancelled: 5 }
      ]
    });

    const res = await api.get(`${BASE_URL}/${uniqueId}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      fulfilmentCancellationId: uniqueId,
      despatchAdviceId: "DA_SUCCESS",
      supplierPartyId: "SUPP_1",
      deliveryPartyId: "DELIV_1",
      cancellationReason: "Goods damaged during loading",
      status: "Created"
    });

    expect(res.body.cancelledItems).toHaveLength(2);
    expect(res.body.cancelledItems[0]).toEqual({
      productId: "p1",
      quantityCancelled: 10,
      reasonCode: "DAMAGED"
    });
    expect(res.body.cancelledItems[1]).not.toHaveProperty("reasonCode");
  });

  it("returns 200 and handles missing Despatch Advice gracefully", async () => {
    const uniqueId = "FC_NO_DA";
    
    await db.collection("fulfilmentCancellations").insertOne({
      fulfilmentCancellationId: uniqueId,
      despatchAdviceId: "NON_EXISTENT_DA",
      status: "Sent",
      cancellationDate: "2026-03-20",
      cancelledItems: []
    });

    const res = await api.get(`${BASE_URL}/${uniqueId}`);

    expect(res.status).toBe(200);
    expect(res.body.supplierPartyId).toBe("");
    expect(res.body.deliveryPartyId).toBe("");
  });
});
