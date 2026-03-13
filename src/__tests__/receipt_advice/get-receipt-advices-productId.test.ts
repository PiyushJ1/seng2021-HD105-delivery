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


