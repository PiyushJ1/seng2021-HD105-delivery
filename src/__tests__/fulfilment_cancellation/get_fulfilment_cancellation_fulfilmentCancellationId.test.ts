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

describe("GET /api/fulfilment-cancellation/[id]", () => {
  it("Returns 400 when ID is whitespace", async () => {
    const res = await api.get(`${BASE_URL}/%20%20`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid fulfilmentCancellationId format");
  });

  it("Returns 404 when ID does not exist in DB", async () => {
    const res = await api.get(`${BASE_URL}/NON_EXISTENT_ID`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Fulfilment cancellation document not found");
  });

  it("Returns 200 and fetches data successfully", async () => {
    const uniqueId = "FC_12345";
    
    await db.collection("despatchAdvices").insertOne({
      despatchAdviceId: "DA_JOIN",
      supplierPartyId: "SUPP1",
      deliveryPartyId: "DELIV1"
    });

    await db.collection("fulfilmentCancellations").insertOne({
      fulfilmentCancellationId: uniqueId,
      despatchAdviceId: "DA_JOIN",
      status: "Created",
      cancellationDate: "2026-03-10",
      reason: "Damaged Items",
      cancelledItems: [{ productId: "p1", quantityCancelled: 5 }]
    });

    const res = await api.get(`${BASE_URL}/${uniqueId}`);

    expect(res.status).toBe(200);
    expect(res.body.fulfilmentCancellationId).toBe(uniqueId);
    expect(res.body.supplierPartyId).toBe("SUPP1");
  });
});
