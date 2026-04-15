import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api } from "../utils";
import { MongoClient } from "mongodb";

const BASE_URL = "/api/v2/supply/inventory-updates/cancellation";
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");

beforeEach(async () => {
  await db.collection("fulfilmentCancellations").deleteMany({});
  await db.collection("warehouses").deleteMany({});
  await db.collection("bins").deleteMany({});
  await db.collection("inventory").deleteMany({});
});

afterAll(async () => {
  await client.close();
});

describe("PUT /api/v2/supply/inventory-updates/cancellation/{fulfilmentCancellationId}", () => {
  it("Returns 401 if auth token is missing", async () => {
    const res = await api.put(`${BASE_URL}/FC-TEST-401`).send({
      warehouseId: "W-1",
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityCancelled: 10 },
      ],
    });
    expect(res.status).toBe(401);
  });

  it("Returns 400 if quantityCancelled is negative", async () => {
    const res = await api.put(`${BASE_URL}/FC-TEST-400-NEG`).send({
      warehouseId: "W-1",
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityCancelled: -1 },
      ],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("negative quantityCancelled");
  });

  it("Returns 404 if fulfilment cancellation does not exist", async () => {
    const res = await api.put(`${BASE_URL}/FC-NOT-FOUND`).send({
      warehouseId: "W-1",
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityCancelled: 10 },
      ],
    });
    expect(res.status).toBe(404);
  });

  it("Applies inventory update successfully and returns 200", async () => {
    await db.collection("fulfilmentCancellations").insertOne({
      fulfilmentCancellationId: "FC001",
      items: [{ sku: "SKU-001", uom: "EA", quantityCancelled: 50 }],
    });
    await db.collection("warehouses").insertOne({ warehouseId: "WH-7" });
    await db
      .collection("bins")
      .insertOne({ warehouseId: "WH-7", binId: "A1-03-02" });
    await db.collection("inventory").insertOne({
      warehouseId: "WH-7",
      binId: "A1-03-02",
      sku: "SKU-001",
      onHand: 150,
      available: 150,
    });

    const res = await api.put(`${BASE_URL}/FC001`).send({
      warehouseId: "WH-7",
      binId: "A1-03-02",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityCancelled: 30 },
      ],
    });

    expect(res.status).toBe(200);
    expect(res.body.applied).toBe(true);
    // Subtraction logic check: 150 - 30 = 120
    expect(res.body.positionsUpdated[0].onHand).toBe(120);
  });
});
