import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api, DESPATCH_ENDPOINT_V2, VALID_DESPATCH_REQUEST } from "../../utils";
import { MongoClient } from "mongodb";
import { requireAuth } from "@/src/lib/auth";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");
const collection = db.collection("despatch_advice");
const usersCollection = db.collection("users");

const despatchUser = {
  email: "despatch.user@example.com",
  password: "despatch-password",
  role: "despatch",
  partyId: "abc123",
};

const deliveryUser = {
  email: "delivery.user@example.com",
  password: "delivery-password",
  role: "delivery",
};

async function login(user: { email: string; password: string; role: string }) {
  await api.post("/api/auth/register").send({
    email: user.email,
    password: user.password,
    role: user.role,
  });

  const res = await api.post("/api/auth/login").send({
    email: user.email,
    password: user.password,
  });

  return res.body.apiKey;
}

async function authHeaders(user: {
  email: string;
  password: string;
  role: string;
}) {
  const apiKey = await login(user);
  const userInfo = await usersCollection.findOne({ email: user.email });
  const partyId = userInfo!.partyId as string;

  return { headers: { apiKey }, partyId };
}

beforeEach(async () => {
  await collection.deleteMany({});
  await usersCollection.deleteMany({
    email: { $in: [despatchUser.email, deliveryUser.email] },
  });
});

afterAll(async () => {
  await client.close();
});

describe("GET /despatch-advice", () => {
  it("returns 200 with despatch advice doc details for a valid request", async () => {
    const { headers, partyId } = await authHeaders(despatchUser);

    // send two despatch creation requests
    await api
      .post(DESPATCH_ENDPOINT_V2)
      .set(headers)
      .send({ ...VALID_DESPATCH_REQUEST, supplierPartyId: partyId });
    const req = {
      orderId: "xyz123",
      supplierPartyId: partyId,
      deliveryPartyId: "abc123",
      despatchDate: "2026-03-01",
      items: [
        {
          productId: "prod1",
          quantity: 10,
        },
        {
          productId: "prod2",
          quantity: 20,
        },
      ],
    };
    await api.post(DESPATCH_ENDPOINT_V2).set(headers).send(req);

    const res = await api.get(DESPATCH_ENDPOINT_V2).set(headers);
    const data = res.body;

    expect(res.status).toBe(200);
    expect(data).toMatchObject({
      despatchAdvices: expect.arrayContaining([
        expect.objectContaining({
          despatchAdviceId: expect.any(String),
          orderId: expect.any(String),
          supplierPartyId: expect.any(String),
          deliveryPartyId: expect.any(String),
          despatchDate: expect.any(String),
          status: expect.stringMatching(/^(Partial|Complete)$/),
          items: expect.arrayContaining([
            expect.objectContaining({
              productId: expect.any(String),
              quantity: expect.any(Number),
            }),
          ]),
        }),
      ]),
    });
  });

  it("returns 404 if a despatch advice does not exist for the requesting party", async () => {
    const { headers } = await authHeaders(deliveryUser);

    const res = await api.get(DESPATCH_ENDPOINT_V2).set(headers);
    const data = res.body;

    expect(res.status).toBe(404);
    expect(data.error).toEqual(expect.any(String));
  });
});
