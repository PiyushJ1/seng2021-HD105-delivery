import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api, DESPATCH_ENDPOINT, VALID_DESPATCH_REQUEST } from "../../utils";
import { MongoClient } from "mongodb";

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

async function login() {
  const res = await api
    .post("/api/auth/login")
    .send({ email: despatchUser.email, password: despatchUser.password });
  return res.body.apiKey as string;
}

beforeEach(async () => {
  await collection.deleteMany({});
  await usersCollection.deleteMany({ email: despatchUser.email });
  await usersCollection.insertOne(despatchUser);
});

afterAll(async () => {
  await client.close();
});

describe("GET /despatch-advice", () => {
  it("returns 200 with despatch advice doc details for a valid request", async () => {
    const apiKey = await login();

    // send two despatch creation requests
    await api
      .post(DESPATCH_ENDPOINT)
      .set({ apiKey })
      .send(VALID_DESPATCH_REQUEST);
    const req = {
      orderId: "abc789",
      supplierPartyId: "abc123",
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
    await api.post(DESPATCH_ENDPOINT).set({ apiKey }).send(req);

    const res = await api.get(DESPATCH_ENDPOINT);
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

  it.todo(
    "returns 404 if a despatch advice does not exist for the requesting party",
  );
});
