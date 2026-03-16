import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { MongoClient } from "mongodb";
import { api, SUPPLY_INVENTORY_ENDPOINT } from "../utils";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");
const cancellations = db.collection("fulfilment_cancellations");
const inventory = db.collection("inventory_positions");

beforeEach(async () => {
  await cancellations.deleteMany({});
  await inventory.deleteMany({});
});

afterAll(async () => {
  await client.close();
});

describe.skip("PUT /supply/inventory-updates/:fulfilmentCancellationId", () => {
  const cancellationId = "FC001";
  const validPayload = {
    warehouseId: "WH-7",
    binId: "A1-03-02",
    inventoryAdjustmentLines: [{ sku: "SKU-001", quantity: 5, uom: "EA" }],
  };

  it("successfully applies inventory updates and returns 200", async () => {
    // Seed the cancellation and the current inventory position
    await cancellations.insertOne({
      fulfilmentCancellationId: cancellationId,
      applied: false,
      items: [{ sku: "SKU-001", quantity: 10 }], // SKU must exist in cancellation
    });

    await inventory.insertOne({
      warehouseId: "WH-7",
      binId: "A1-03-02",
      sku: "SKU-001",
      uom: "EA",
      onHand: 115,
      available: 120,
    });

    const res = await api
      .put(`${SUPPLY_INVENTORY_ENDPOINT}/${cancellationId}`)
      .send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      fulfilmentCancellationId: cancellationId,
      applied: true,
      positionsUpdated: [
        expect.objectContaining({
          sku: "SKU-001",
          onHand: 120, // 115 + 5
          available: 125, // 120 + 5
        }),
      ],
    });
  });

  it("returns 409 if the cancellation was already applied", async () => {
    await cancellations.insertOne({
      fulfilmentCancellationId: cancellationId,
      applied: true,
    });

    const res = await api
      .put(`${SUPPLY_INVENTORY_ENDPOINT}/${cancellationId}`)
      .send(validPayload);
    expect(res.status).toBe(409);
  });

  it("returns 422 if quantity exceeds cancellable quantity", async () => {
    await cancellations.insertOne({
      fulfilmentCancellationId: cancellationId,
      applied: false,
      items: [{ sku: "SKU-001", quantity: 2 }], // Only 2 allowed
    });

    const res = await api
      .put(`${SUPPLY_INVENTORY_ENDPOINT}/${cancellationId}`)
      .send(validPayload);
    expect(res.status).toBe(422);
  });
});
