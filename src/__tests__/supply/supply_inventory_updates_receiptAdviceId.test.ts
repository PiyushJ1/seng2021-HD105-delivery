import { expect, describe, it, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { MongoClient } from "mongodb";

const BASE_URL = "/api/supply/inventory-updates";
const api = request("http://localhost:3000");
const mongoUri = process.env.MONGODB_URI;
const client = mongoUri ? new MongoClient(mongoUri) : (null as unknown as MongoClient);
const db = client ? client.db("test") : (null as unknown as ReturnType<MongoClient["db"]>);

beforeEach(async () => {
  if (!client) return;
  await db.collection("receiptAdvices").deleteMany({});
  await db.collection("warehouses").deleteMany({});
  await db.collection("bins").deleteMany({});
  await db.collection("inventory").deleteMany({});
});

afterAll(async () => {
  if (client) await client.close();
});

describe.skip("PUT /api/supply/inventory-updates/{receiptAdviceId}", () => {
  it("Returns 401 if auth token is missing", async () => {
    const res = await api
      .put(`${BASE_URL}/RA-TEST-401`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "missing auth token" });
  });

  it("Returns 400 if warehouseId is missing", async () => {
    const res = await api
      .put(`${BASE_URL}/RA-TEST-400`)
      .send({
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "missing warehouseId" });
  });

  it("Returns 400 if binId is missing", async () => {
    const res = await api
      .put(`${BASE_URL}/RA-TEST-400-BIN`)
      .send({
        warehouseId: "W-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "missing binId" });
  });

  it("Returns 400 if inventoryAdjustmentLines is empty", async () => {
    const res = await api
      .put(`${BASE_URL}/RA-TEST-400-LINES`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "empty lines" });
  });

  it("Returns 400 if sku is missing from a line", async () => {
    const res = await api
      .put(`${BASE_URL}/RA-TEST-400-SKU`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [{ uom: "EA", quantityReceived: 10 }],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid or missing fields" });
  });

  it("Returns 400 if quantityReceived is invalid", async () => {
    const res = await api
      .put(`${BASE_URL}/RA-TEST-400-QTY`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: "abc" },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid or missing fields" });
  });

  it("Returns 400 if quantityReceived is negative", async () => {
    const res = await api
      .put(`${BASE_URL}/RA-TEST-400-NEG`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: -1 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "negative quantityReceived" });
  });

  it("Returns 400 if warehouseId is bad UUID format", async () => {
    const res = await api
      .put(`${BASE_URL}/RA-TEST-400-UUID`)
      .send({
        warehouseId: "550e8400-e29b-71d4-a716-446655440000",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "bad UUID format" });
  });

  it("Returns 404 if receipt advice does not exist", async () => {
    await db.collection("warehouses").insertOne({
      warehouseId: "W-1",
      name: "Main Warehouse",
    });
    await db.collection("bins").insertOne({
      warehouseId: "W-1",
      binId: "B-1",
      label: "Bin 1",
    });

    const res = await api
      .put(`${BASE_URL}/RA-NOT-FOUND`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: "receipt advice ID, warehouse ID or bin ID not found",
    });
  });

  it("Returns 404 if warehouse does not exist", async () => {
    await db.collection("receiptAdvices").insertOne({
      receiptAdviceId: "RA12345",
      receivedDate: "2026-03-01",
      items: [{ sku: "SKU-001", uom: "EA", quantityReceived: 10 }],
    });

    const res = await api
      .put(`${BASE_URL}/RA12345`)
      .send({
        warehouseId: "W-404",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: "receipt advice ID, warehouse ID or bin ID not found",
    });
  });

  it("Returns 404 if bin does not exist", async () => {
    await db.collection("receiptAdvices").insertOne({
      receiptAdviceId: "RA12345",
      receivedDate: "2026-03-01",
      items: [{ sku: "SKU-001", uom: "EA", quantityReceived: 10 }],
    });
    await db.collection("warehouses").insertOne({
      warehouseId: "W-1",
      name: "Main Warehouse",
    });

    const res = await api
      .put(`${BASE_URL}/RA12345`)
      .send({
        warehouseId: "W-1",
        binId: "B-404",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: "receipt advice ID, warehouse ID or bin ID not found",
    });
  });

  it("Returns 409 if receipt advice is already applied", async () => {
    await db.collection("receiptAdvices").insertOne({
      receiptAdviceId: "RA12345",
      receivedDate: "2026-03-01",
      inventoryUpdateApplied: true,
      items: [{ sku: "SKU-001", uom: "EA", quantityReceived: 10 }],
    });
    await db.collection("warehouses").insertOne({
      warehouseId: "W-1",
      name: "Main Warehouse",
    });
    await db.collection("bins").insertOne({
      warehouseId: "W-1",
      binId: "B-1",
      label: "Bin 1",
    });

    const res = await api
      .put(`${BASE_URL}/RA12345`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "receipt already applied" });
  });

  it("Returns 409 if receipt advice not in applicable state", async () => {
    await db.collection("receiptAdvices").insertOne({
      receiptAdviceId: "RA12345",
      receivedDate: "2026-03-01",
      status: "cancelled",
      items: [{ sku: "SKU-001", uom: "EA", quantityReceived: 10 }],
    });
    await db.collection("warehouses").insertOne({
      warehouseId: "W-1",
      name: "Main Warehouse",
    });
    await db.collection("bins").insertOne({
      warehouseId: "W-1",
      binId: "B-1",
      label: "Bin 1",
    });

    const res = await api
      .put(`${BASE_URL}/RA12345`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: "receipt advice not in a state that can be applied",
    });
  });

  it("Returns 422 if SKU is not in the receipt advice", async () => {
    await db.collection("receiptAdvices").insertOne({
      receiptAdviceId: "RA12345",
      receivedDate: "2026-03-01",
      items: [{ sku: "SKU-001", uom: "EA", quantityReceived: 10 }],
    });
    await db.collection("warehouses").insertOne({
      warehouseId: "W-1",
      name: "Main Warehouse",
    });
    await db.collection("bins").insertOne({
      warehouseId: "W-1",
      binId: "B-1",
      label: "Bin 1",
    });

    const res = await api
      .put(`${BASE_URL}/RA12345`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-999", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.status).toBe(422);
    expect(res.body).toEqual({ error: "invalid SKU or UoM mismatch" });
  });

  it("Returns 422 if quantity exceeds receipt advice quantity", async () => {
    await db.collection("receiptAdvices").insertOne({
      receiptAdviceId: "RA12345",
      receivedDate: "2026-03-01",
      items: [{ sku: "SKU-001", uom: "EA", quantityReceived: 10 }],
    });
    await db.collection("warehouses").insertOne({
      warehouseId: "W-1",
      name: "Main Warehouse",
    });
    await db.collection("bins").insertOne({
      warehouseId: "W-1",
      binId: "B-1",
      label: "Bin 1",
    });

    const res = await api
      .put(`${BASE_URL}/RA12345`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 99 },
        ],
      });

    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      error: "received quantity exceeds allowed qty",
    });
  });

  it("Applies inventory update successfully", async () => {
    await db.collection("receiptAdvices").insertOne({
      receiptAdviceId: "RA12345",
      receivedDate: "2026-03-01",
      items: [
        { sku: "SKU-001", uom: "EA", quantityReceived: 50 },
        { sku: "SKU-001", uom: "EA", quantityReceived: 30 },
        { sku: "SKU-002", uom: "EA", quantityReceived: 20 },
      ],
    });
    await db.collection("warehouses").insertOne({
      warehouseId: "W-7",
      name: "Warehouse 7",
    });
    await db.collection("bins").insertOne({
      warehouseId: "W-7",
      binId: "A1-03-02",
      label: "A1-03-02",
    });

    const res = await api
      .put(`${BASE_URL}/RA12345`)
      .send({
        warehouseId: "W-7",
        binId: "A1-03-02",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 80 },
          { sku: "SKU-002", uom: "EA", quantityReceived: 20 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.receiptAdviceId).toBe("RA12345");
    expect(res.body.applied).toBe(true);
    expect(Array.isArray(res.body.positionsUpdated)).toBe(true);
    expect(res.body.positionsUpdated).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          warehouseId: "W-7",
          binId: "A1-03-02",
          sku: "SKU-001",
          uom: "EA",
          onHand: 80,
          available: 80,
        }),
        expect.objectContaining({
          warehouseId: "W-7",
          binId: "A1-03-02",
          sku: "SKU-002",
          uom: "EA",
          onHand: 20,
          available: 20,
        }),
      ]),
    );

    const receipt = await db.collection("receiptAdvices").findOne({
      receiptAdviceId: "RA12345",
    });
    expect(receipt?.inventoryUpdateApplied).toBe(true);

    const inventoryRows = await db.collection("inventory").find({}).toArray();
    expect(inventoryRows).toHaveLength(2);
  });
});
