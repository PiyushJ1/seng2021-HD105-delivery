import request from "supertest";
import { MongoClient } from "mongodb";
import { SignJWT } from "jose";
import { beforeAll, afterAll, beforeEach, describe, expect, test } from "vitest";

const BASE_URL = "http://localhost:3000";
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function generateToken(
  role: "delivery_party" | "despatch_party",
  orgId?: string,
) {
  const secret = new TextEncoder().encode(jwtSecret!);

  return await new SignJWT(orgId ? { role, orgId } : { role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(generateId("USER"))
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

let client: MongoClient | null = null;

beforeAll(async () => {
  if (!mongoUri || !jwtSecret) {
    console.warn(
      "Skipping supply inventory-updates integration tests: MONGODB_URI and JWT_SECRET are required.",
    );
    return;
  }

  client = new MongoClient(mongoUri);
  await client.connect();
});

afterAll(async () => {
  if (client) {
    await client.close();
  }
});

beforeEach(async () => {
  if (!client) return;
  const db = client.db();

  await db.collection("receiptAdvices").deleteMany({});
  await db.collection("warehouses").deleteMany({});
  await db.collection("bins").deleteMany({});
  await db.collection("inventory").deleteMany({});
});

describe("PUT /supply/inventory-updates/{receiptAdviceId}", () => {
  test("Returns 401 if auth token is missing", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const res = await request(BASE_URL)
      .put(`/api/supply/inventory-updates/${generateId("RA")}`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      error: "missing auth token",
    });
  });

  test("Returns 403 if user is not a despatch party", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("delivery_party", "DEL001");

    const res = await request(BASE_URL)
      .put(`/api/supply/inventory-updates/${generateId("RA")}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      error: "Not authorised",
    });
  });

  test("Returns 400 if warehouseId is missing", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const res = await request(BASE_URL)
      .put(`/api/supply/inventory-updates/${generateId("RA")}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "missing warehouseId",
    });
  });

  test("Returns 400 if binId is missing", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const res = await request(BASE_URL)
      .put(`/api/supply/inventory-updates/${generateId("RA")}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "missing binId",
    });
  });

  test("Returns 400 if inventoryAdjustmentLines is missing", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const res = await request(BASE_URL)
      .put(`/api/supply/inventory-updates/${generateId("RA")}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "empty lines",
    });
  });

  test("Returns 400 if sku is missing from a line", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const res = await request(BASE_URL)
      .put(`/api/supply/inventory-updates/${generateId("RA")}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Invalid or missing fields",
    });
  });

  test("Returns 400 if quantityReceived is invalid", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const res = await request(BASE_URL)
      .put(`/api/supply/inventory-updates/${generateId("RA")}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: "abc" },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Invalid or missing fields",
    });
  });

  test("Returns 400 if quantityReceived is negative", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const res = await request(BASE_URL)
      .put(`/api/supply/inventory-updates/${generateId("RA")}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: -1 },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "negative quantityReceived",
    });
  });

  test("Returns 400 if warehouseId is bad UUID format", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const res = await request(BASE_URL)
      .put(`/api/supply/inventory-updates/${generateId("RA")}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "550e8400-e29b-71d4-a716-446655440000",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "bad UUID format" });
  });

  test("Returns 404 if receipt advice does not exist", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const db = client.db();
    await db.collection("warehouses").insertOne({
      warehouseId: "W-1",
      name: "Main Warehouse",
    });
    await db.collection("bins").insertOne({
      warehouseId: "W-1",
      binId: "B-1",
      label: "Bin 1",
    });

    const res = await request(BASE_URL)
      .put("/api/supply/inventory-updates/RA-NOT-FOUND")
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error:
        "receipt advice ID, warehouse ID or bin ID not found",
    });
  });

  test("Returns 404 if warehouse does not exist", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const db = client.db();
    await db.collection("receiptAdvices").insertOne({
      receiptAdviceId: "RA12345",
      receivedDate: "2026-03-01",
      items: [{ sku: "SKU-001", uom: "EA", quantityReceived: 10 }],
    });

    const res = await request(BASE_URL)
      .put("/api/supply/inventory-updates/RA12345")
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-404",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error:
        "receipt advice ID, warehouse ID or bin ID not found",
    });
  });

  test("Returns 404 if bin does not exist", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const db = client.db();
    await db.collection("receiptAdvices").insertOne({
      receiptAdviceId: "RA12345",
      receivedDate: "2026-03-01",
      items: [{ sku: "SKU-001", uom: "EA", quantityReceived: 10 }],
    });
    await db.collection("warehouses").insertOne({
      warehouseId: "W-1",
      name: "Main Warehouse",
    });

    const res = await request(BASE_URL)
      .put("/api/supply/inventory-updates/RA12345")
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        binId: "B-404",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error:
        "receipt advice ID, warehouse ID or bin ID not found",
    });
  });

  test("Returns 409 if receipt advice is already applied", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const db = client.db();
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

    const res = await request(BASE_URL)
      .put("/api/supply/inventory-updates/RA12345")
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: "receipt already applied",
    });
  });

  test("Returns 409 if receipt advice not in applicable state", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const db = client.db();
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

    const res = await request(BASE_URL)
      .put("/api/supply/inventory-updates/RA12345")
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: "receipt advice not in a state that can be applied",
    });
  });

  test("Returns 422 if SKU is not in the receipt advice", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const db = client.db();
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

    const res = await request(BASE_URL)
      .put("/api/supply/inventory-updates/RA12345")
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-999", uom: "EA", quantityReceived: 10 },
        ],
      });

    expect(res.statusCode).toBe(422);
    expect(res.body).toEqual({
      error: "invalid SKU or UoM mismatch",
    });
  });

  test("Returns 422 if quantity exceeds receipt advice quantity", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const db = client.db();
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

    const res = await request(BASE_URL)
      .put("/api/supply/inventory-updates/RA12345")
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 99 },
        ],
      });

    expect(res.statusCode).toBe(422);
    expect(res.body).toEqual({
      error: "received quantity exceeds allowed qty",
    });
  });

  test("Applies inventory update successfully", async () => {
    if (!mongoUri || !jwtSecret || !client) return;
    const token = await generateToken("despatch_party");

    const db = client.db();
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

    const res = await request(BASE_URL)
      .put("/api/supply/inventory-updates/RA12345")
      .set("Authorization", `Bearer ${token}`)
      .send({
        warehouseId: "W-7",
        binId: "A1-03-02",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 80 },
          { sku: "SKU-002", uom: "EA", quantityReceived: 20 },
        ],
      });

    expect(res.statusCode).toBe(200);
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