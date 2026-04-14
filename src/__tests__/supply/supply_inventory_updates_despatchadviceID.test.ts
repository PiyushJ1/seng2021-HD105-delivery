import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api } from "../utils";
import { MongoClient } from "mongodb";

const BASE_URL = "/api/v2/supply/inventory-updates/despatch";
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test"); 

beforeEach(async () => {
  await db.collection("despatch_advice").deleteMany({});
  await db.collection("warehouses").deleteMany({});
  await db.collection("bins").deleteMany({});
  await db.collection("inventory").deleteMany({});
});

afterAll(async () => {
  await client.close();
});

describe("PUT /api/v2/supply/inventory-updates/despatch/{despatchAdviceId}", () => {
  it("Returns 401 if auth token is missing", async () => {
    const res = await api.put(`${BASE_URL}/DA-TEST-401`).send({
      warehouseId: "W-1", binId: "B-1", inventoryAdjustmentLines: [{ sku: "SKU-001", uom: "EA", quantityDespatched: 10 }],
    });
    expect(res.status).toBe(401);
  });

  it("Returns 400 if quantityDespatched is negative", async () => {
    const res = await api.put(`${BASE_URL}/DA-TEST-400-NEG`).send({
      warehouseId: "W-1", binId: "B-1", inventoryAdjustmentLines: [{ sku: "SKU-001", uom: "EA", quantityDespatched: -1 }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("negative quantityDespatched");
  });

  it("Returns 404 if despatch advice does not exist", async () => {
    const res = await api.put(`${BASE_URL}/DA-NOT-FOUND`).send({
      warehouseId: "W-1", binId: "B-1", inventoryAdjustmentLines: [{ sku: "SKU-001", uom: "EA", quantityDespatched: 10 }],
    });
    expect(res.status).toBe(404);
  });

  it("Applies inventory update successfully and returns 200", async () => {
    await db.collection("despatch_advice").insertOne({
      despatchAdviceId: "DA12345",
      items: [{ sku: "SKU-001", uom: "EA", quantityDespatched: 50 }],
    });
    await db.collection("warehouses").insertOne({ warehouseId: "W-7" });
    await db.collection("bins").insertOne({ warehouseId: "W-7", binId: "A1-03-02" });
    await db.collection("inventory").insertOne({
      warehouseId: "W-7", binId: "A1-03-02", sku: "SKU-001", onHand: 100, available: 100
    });

    const res = await api.put(`${BASE_URL}/DA12345`).send({
      warehouseId: "W-7", binId: "A1-03-02",
      inventoryAdjustmentLines: [{ sku: "SKU-001", uom: "EA", quantityDespatched: 20 }],
    });

    expect(res.status).toBe(200);
    expect(res.body.applied).toBe(true);
    // Subtraction logic check: 100 - 20 = 80
    expect(res.body.positionsUpdated[0].onHand).toBe(80);
  });
});