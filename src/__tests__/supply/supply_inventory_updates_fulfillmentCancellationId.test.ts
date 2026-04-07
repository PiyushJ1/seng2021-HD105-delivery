import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api } from "../utils";
import { MongoClient } from "mongodb";

const INVENTORY_ENDPOINT = "/api/v2/supply/inventory-updates";
const fcCollectionName = "fulfilmentCancellations";
const warehouseCollection = "warehouses";
const binCollection = "bins";
const inventoryCollection = "inventory";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");

const fcCollection = db.collection(fcCollectionName);
const warehouseCol = db.collection(warehouseCollection);
const binCol = db.collection(binCollection);
const inventoryCol = db.collection(inventoryCollection);

const fcId = "test-fc-1";
const warehouseId = "wh-1";
const binId = "bin-1";
const sku = "SKU123";

beforeEach(async () => {
  await fcCollection.deleteMany({});
  await warehouseCol.deleteMany({});
  await binCol.deleteMany({});
  await inventoryCol.deleteMany({});

  await fcCollection.insertOne({
    fulfilmentCancellationId: fcId,
    status: "requested",
    items: [{ sku, quantityCancelled: 10 }],
    inventoryUpdateApplied: false,
  });

  await warehouseCol.insertOne({ warehouseId });
  await binCol.insertOne({ warehouseId, binId });
  await inventoryCol.insertOne({
    warehouseId,
    binId,
    sku,
    onHand: 20,
    available: 20,
    uom: "EA",
  });
});

afterAll(async () => {
  await client.close();
});

describe.skip("PUT /api/v2/supply/inventory-updates/:fulfilmentCancellationId", () => {
  it("returns 401 if auth token is missing", async () => {
    const res = await api.put(`${INVENTORY_ENDPOINT}/${fcId}`).send({});
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("missing auth token");
  });

  it("returns 400 if quantityCancelled is negative", async () => {
    const res = await api
      .put(`${INVENTORY_ENDPOINT}/${fcId}`)
      .set({ authorization: "token" })
      .send({
        warehouseId,
        binId,
        inventoryAdjustmentLines: [{ sku, quantityCancelled: -5 }],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("negative quantityCancelled");
  });

  it("returns 404 if fulfilment cancellation does not exist", async () => {
    const res = await api
      .put(`${INVENTORY_ENDPOINT}/nonexistent-fc`)
      .set({ authorization: "token" })
      .send({
        warehouseId,
        binId,
        inventoryAdjustmentLines: [{ sku, quantityCancelled: 1 }],
      });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("fulfilment cancellation not found");
  });

  it("returns 409 if cancellation already applied", async () => {
    // Apply once
    await api
      .put(`${INVENTORY_ENDPOINT}/${fcId}`)
      .set({ authorization: "token" })
      .send({
        warehouseId,
        binId,
        inventoryAdjustmentLines: [{ sku, quantityCancelled: 1 }],
      });

    // Apply again should return 409
    const res = await api
      .put(`${INVENTORY_ENDPOINT}/${fcId}`)
      .set({ authorization: "token" })
      .send({
        warehouseId,
        binId,
        inventoryAdjustmentLines: [{ sku, quantityCancelled: 1 }],
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("cancellation already applied");
  });

  it("returns 422 if SKU not in cancellation", async () => {
    const newFcId = "test-fc-2";
    await fcCollection.insertOne({
      fulfilmentCancellationId: newFcId,
      items: [{ sku: "OTHER_SKU", quantityCancelled: 5 }],
      inventoryUpdateApplied: false,
    });

    const res = await api
      .put(`${INVENTORY_ENDPOINT}/${newFcId}`)
      .set({ authorization: "token" })
      .send({
        warehouseId,
        binId,
        inventoryAdjustmentLines: [{ sku, quantityCancelled: 1 }],
      });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("SKU not in cancellation");
  });

  it("applies cancellation and returns 200", async () => {
    const newFcId = "test-fc-3";
    await fcCollection.insertOne({
      fulfilmentCancellationId: newFcId,
      items: [{ sku, quantityCancelled: 5 }],
      inventoryUpdateApplied: false,
    });

    const res = await api
      .put(`${INVENTORY_ENDPOINT}/${newFcId}`)
      .set({ authorization: "token" })
      .send({
        warehouseId,
        binId,
        inventoryAdjustmentLines: [{ sku, quantityCancelled: 5 }],
      });

    expect(res.status).toBe(200);
    expect(res.body.applied).toBe(true);
    expect(res.body.positionsUpdated).toHaveLength(1);
    expect(res.body.positionsUpdated[0].onHand).toBe(15);
    expect(res.body.positionsUpdated[0].available).toBe(15);
  });
});
