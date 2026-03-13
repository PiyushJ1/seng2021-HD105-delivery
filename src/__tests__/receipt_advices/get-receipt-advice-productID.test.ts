import request from "supertest";
import { MongoClient } from "mongodb";
import { SignJWT } from "jose";
import { beforeAll, afterAll, beforeEach, describe, expect, test, } from "vitest";

const BASE_URL = "http://localhost:3000";

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function makeToken(
  role: "delivery_party" | "despatch_party",
  orgId?: string,
) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  return await new SignJWT(orgId ? { role, orgId } : { role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(uniqueId("user"))
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

let client: MongoClient | null = null;
const mongoUri = process.env.MONGODB_URI;

// Runs once before all tests to check MONGODB_URI exists
beforeAll(async () => {
  if (!mongoUri) {
    console.warn(
      "Skipping receipt-advices API integration tests: MONGODB_URI is not set.",
    );
    return;
  }

  client = new MongoClient(mongoUri);
  await client.connect();
});

// Runs once after all tests finish to check if Mongo client was opened
afterAll(async () => {
  if (client) {
    await client.close();
  }
});

// Before each test clear the receiptAdvices collection
beforeEach(async () => {
  if (!client) return;
  const db = client.db();
  await db.collection("receiptAdvices").deleteMany({});
});

describe("GET /receipt-advices?productId={productId}", () => {
  test("Returns 400 if productId is missing", async () => {
    if (!mongoUri || !client) return;
    const token = await makeToken("despatch_party");

    const res = await request(BASE_URL)
      .get("/api/receipt-advices")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: "Missing productId parameter",
    });
  });

  test("Returns 403 if auth token is missing", async () => {
    if (!mongoUri || !client) return;
    const res = await request(BASE_URL)
      .get("/api/receipt-advices")
      .query({ productId: "PROD001" });

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      error: "Not authorised to view",
    });
  });

  test("Returns 403 if user is not a despatch party", async () => {
    if (!mongoUri || !client) return;
    const token = await makeToken("delivery_party", "DEL001");

    const res = await request(BASE_URL)
      .get("/api/receipt-advices")
      .query({ productId: "PROD001" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      error: "Not authorised to view",
    });
  });

  test("Returns 404 if no receipt advice matches the productId", async () => {
    if (!mongoUri || !client) return;
    const token = await makeToken("despatch_party");

    const res = await request(BASE_URL)
      .get("/api/receipt-advices")
      .query({ productId: "PROD001" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: "No receipt found",
    });
  });

  test("Returns matching receipt advice records for a valid despatch party", async () => {
    if (!mongoUri || !client) return;
    const db = client.db();
    const productId = uniqueId("PROD");

    await db.collection("receiptAdvices").insertMany([
      {
        receiptAdviceId: "REC001",
        receivedDate: "2026-03-01",
        items: [
          { productId, quantityReceived: 50 },
          { productId: uniqueId("OTHER"), quantityReceived: 20 },
          { productId, quantityReceived: 30 },
        ],
      },
      {
        receiptAdviceId: "REC002",
        receivedDate: "2026-03-02",
        items: [{ productId, quantityReceived: 40 }],
      },
    ]);

    const token = await makeToken("despatch_party");

    const res = await request(BASE_URL)
      .get("/api/receipt-advices")
      .query({ productId })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      {
        receiptAdviceId: "REC001",
        quantityReceived: 80,
        receivedDate: "2026-03-01",
      },
      {
        receiptAdviceId: "REC002",
        quantityReceived: 40,
        receivedDate: "2026-03-02",
      },
    ]);
  });
});