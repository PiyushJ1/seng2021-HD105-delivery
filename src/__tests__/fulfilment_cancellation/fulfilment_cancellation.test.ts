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
      "Skipping fulfilment-cancellation integration tests: MONGODB_URI and JWT_SECRET are required.",
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

  await db.collection("despatchAdvices").deleteMany({});
  await db.collection("fulfilmentCancellations").deleteMany({});
});

describe("POST /fulfilment-cancellation", () => {
    test("Creates fulfilment cancellation successfully", async () => {
      if (!mongoUri || !jwtSecret || !client) return;
      const token = await generateToken("despatch_party");
      const db = client.db();
  
      await db.collection("despatchAdvices").insertOne({
        despatchAdviceId: "DES2001",
        items: [
          { productId: "prod1", quantityDespatched: 50 },
          { productId: "prod2", quantityDespatched: 20 },
        ],
      });
  
      const res = await request(BASE_URL)
        .post("/api/fulfilment-cancellation")
        .set("Authorization", `Bearer ${token}`)
        .send({
          despatchAdviceId: "DES2001",
          reason: "damaged goods in transit",
          cancellationDate: "2026-03-01",
          cancelledItems: [
            {
              productId: "prod1",
              quantityCancelled: 20,
              reasonCode: "DAMAGED",
            },
            {
              productId: "prod2",
              quantityCancelled: 10,
              reasonCode: "CUSTOMER_REQUEST",
            },
          ],
        });
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        fulfilmentCancellationId: expect.any(String),
        status: "Created",
        despatchAdviceId: "DES2001",
      });
    });
  
    test("Returns 400 if fields are missing", async () => {
      if (!mongoUri || !jwtSecret || !client) return;
      const token = await generateToken("despatch_party");
  
      const res = await request(BASE_URL)
        .post("/api/fulfilment-cancellation")
        .set("Authorization", `Bearer ${token}`)
        .send({
          despatchAdviceId: "DES2001",
        });
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Invalid or missing fields",
      });
    });
  
    test("Returns 400 if cancellationDate is invalid", async () => {
      if (!mongoUri || !jwtSecret || !client) return;
      const token = await generateToken("despatch_party");
  
      const res = await request(BASE_URL)
        .post("/api/fulfilment-cancellation")
        .set("Authorization", `Bearer ${token}`)
        .send({
          despatchAdviceId: "DES2001",
          cancellationDate: "01-03-2026",
          cancelledItems: [
            {
              productId: "prod1",
              quantityCancelled: 20,
            },
          ],
        });
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Invalid or missing fields",
      });
    });
  
    test("Returns 403 if user is not authorised", async () => {
      if (!mongoUri || !jwtSecret || !client) return;
      const token = await generateToken("delivery_party", "DEL001");
  
      const res = await request(BASE_URL)
        .post("/api/fulfilment-cancellation")
        .set("Authorization", `Bearer ${token}`)
        .send({
          despatchAdviceId: "DES2001",
          cancellationDate: "2026-03-01",
          cancelledItems: [
            {
              productId: "prod1",
              quantityCancelled: 20,
            },
          ],
        });
  
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({
        error: "Not authorized to create fulfilment cancellation document",
      });
    });
  
    test("Returns 404 if despatchAdviceId is not found", async () => {
      if (!mongoUri || !jwtSecret || !client) return;
      const token = await generateToken("despatch_party");
  
      const res = await request(BASE_URL)
        .post("/api/fulfilment-cancellation")
        .set("Authorization", `Bearer ${token}`)
        .send({
          despatchAdviceId: "DES404",
          cancellationDate: "2026-03-01",
          cancelledItems: [
            {
              productId: "prod1",
              quantityCancelled: 20,
            },
          ],
        });
  
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        error: "despatchAdviceId not found",
      });
    });
  
    test("Returns 409 if fulfilment cancellation already exists", async () => {
      if (!mongoUri || !jwtSecret || !client) return;
      const token = await generateToken("despatch_party");
      const db = client.db();
  
      await db.collection("despatchAdvices").insertOne({
        despatchAdviceId: "DES2001",
        items: [{ productId: "prod1", quantityDespatched: 50 }],
      });
  
      await db.collection("fulfilmentCancellations").insertOne({
        fulfilmentCancellationId: "FC001",
        status: "Created",
        despatchAdviceId: "DES2001",
        cancellationDate: "2026-03-01",
        cancelledItems: [
          {
            productId: "prod1",
            quantityCancelled: 20,
          },
        ],
      });
  
      const res = await request(BASE_URL)
        .post("/api/fulfilment-cancellation")
        .set("Authorization", `Bearer ${token}`)
        .send({
          despatchAdviceId: "DES2001",
          cancellationDate: "2026-03-01",
          cancelledItems: [
            {
              productId: "prod1",
              quantityCancelled: 10,
            },
          ],
        });
  
      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({
        error:
          "Fulfilment cancellation document already exists for this despatchAdviceId",
      });
    });
  
    test("Returns 422 if productId is not in despatch advice", async () => {
      if (!mongoUri || !jwtSecret || !client) return;
      const token = await generateToken("despatch_party");
      const db = client.db();
  
      await db.collection("despatchAdvices").insertOne({
        despatchAdviceId: "DES2001",
        items: [{ productId: "prod1", quantityDespatched: 50 }],
      });
  
      const res = await request(BASE_URL)
        .post("/api/fulfilment-cancellation")
        .set("Authorization", `Bearer ${token}`)
        .send({
          despatchAdviceId: "DES2001",
          cancellationDate: "2026-03-01",
          cancelledItems: [
            {
              productId: "prod999",
              quantityCancelled: 10,
            },
          ],
        });
  
      expect(res.statusCode).toBe(422);
      expect(res.body).toEqual({
        error: "productId not in despatch advice: prod999",
      });
    });
  
    test("Returns 422 if quantityCancelled exceeds quantity despatched", async () => {
      if (!mongoUri || !jwtSecret || !client) return;
      const token = await generateToken("despatch_party");
      const db = client.db();
  
      await db.collection("despatchAdvices").insertOne({
        despatchAdviceId: "DES2001",
        items: [{ productId: "prod1", quantityDespatched: 50 }],
      });
  
      const res = await request(BASE_URL)
        .post("/api/fulfilment-cancellation")
        .set("Authorization", `Bearer ${token}`)
        .send({
          despatchAdviceId: "DES2001",
          cancellationDate: "2026-03-01",
          cancelledItems: [
            {
              productId: "prod1",
              quantityCancelled: 60,
            },
          ],
        });
  
      expect(res.statusCode).toBe(422);
      expect(res.body).toEqual({
        error: "quantityCancelled exceeds quantity despatched for productId: prod1",
      });
    });
  
    test("Sums duplicate cancelledItems product quantities before validation", async () => {
      if (!mongoUri || !jwtSecret || !client) return;
      const token = await generateToken("despatch_party");
      const db = client.db();
  
      await db.collection("despatchAdvices").insertOne({
        despatchAdviceId: "DES2001",
        items: [{ productId: "prod1", quantityDespatched: 25 }],
      });
  
      const res = await request(BASE_URL)
        .post("/api/fulfilment-cancellation")
        .set("Authorization", `Bearer ${token}`)
        .send({
          despatchAdviceId: "DES2001",
          cancellationDate: "2026-03-01",
          cancelledItems: [
            {
              productId: "prod1",
              quantityCancelled: 20,
            },
            {
              productId: "prod1",
              quantityCancelled: 10,
            },
          ],
        });
  
      expect(res.statusCode).toBe(422);
      expect(res.body).toEqual({
        error: "quantityCancelled exceeds quantity despatched for productId: prod1",
      });
    });
  });