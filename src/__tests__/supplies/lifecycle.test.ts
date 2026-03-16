import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api } from "../utils";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");
const suppliesCollection = db.collection("supplies"); 

const getEndpoint = (id: string) => `/api/supplies/${id}/lifecycle`;

beforeEach(async () => {
  await suppliesCollection.deleteMany({});
  
  await suppliesCollection.insertOne({
    supplyId: "SUPP12345",
    orderId: "ORD12345",
    receiptAdviceId: "RA12345",
    warehouseId: "WH-7",
    lifecycleState: "PLANNED",
    version: 3 
  });
});

afterAll(async () => {
  await client.close();
});

describe.skip("PATCH /api/supplies/:supplyId/lifecycle", () => {
  it("Updates lifecycle state successfully and returns 200", async () => {
    const req = {
      newState: "IN_TRANSIT",
      expectedVersion: 3, 
      reasonCode: "SHIPPED",
    };
    const res = await api.patch(getEndpoint("SUPP12345")).send(req);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      supplyId: "SUPP12345",
      lifecycleState: "IN_TRANSIT",
      version: 4,
      stateUpdatedAt: expect.any(String)
    });
  });

  it("Returns 400 if newState is missing or invalid", async () => {
    const req = {
      expectedVersion: 3
    };

    const res = await api.patch(getEndpoint("SUPP12345")).send(req);

    expect(res.status).toBe(400);
  });

  it("Returns 404 if supply ID is not found", async () => {
    const req = {
      newState: "IN_TRANSIT",
      expectedVersion: 3
    };

    const res = await api.patch(getEndpoint("FAKE_ID_999")).send(req);

    expect(res.status).toBe(404);
  });

  it("Returns 409 Conflict if expectedVersion does not match server", async () => {
    const req = {
      newState: "IN_TRANSIT",
      expectedVersion: 1 
    };
    const res = await api.patch(getEndpoint("SUPP12345")).send(req);

    expect(res.status).toBe(409);
  });
});