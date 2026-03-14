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
