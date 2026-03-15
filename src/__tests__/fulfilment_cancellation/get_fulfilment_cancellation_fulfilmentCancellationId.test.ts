import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { SignJWT } from "jose";
import { MongoClient } from "mongodb";
import request from "supertest";

const api = request("http://localhost:3000");
const FULFILMENT_CANCELLATIONS_ENDPOINT = "/api/fulfilment-cancellations";

const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const hasEnv = Boolean(mongoUri && jwtSecret);

let client: MongoClient | null = null;

async function createTestToken(role: "delivery_party" | "despatch_party", orgId?: string): Promise<string> {
  const secret = new TextEncoder().encode(jwtSecret);
  return new SignJWT({ role, orgId: orgId ?? "" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("test-user")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}
