import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { MongoClient } from "mongodb";
import { api, DESPATCH_ENDPOINT, VALID_DESPATCH_REQUEST } from "../../utils";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");
const collection = db.collection("despatch_advice");
const usersCollection = db.collection("users");

const despatchUser = {
  email: "despatch.user@example.com",
  password: "despatch-password",
  role: "despatch",
  partyId: "party123",
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

describe("GET /despatch-advice/:despatchAdviceId", () => {
  it("returns 200 with details for a specific despatch advice doc", async () => {
    const apiKey = await login();
    const res1 = await api
      .post(DESPATCH_ENDPOINT)
      .set({ apiKey })
      .send(VALID_DESPATCH_REQUEST);
    const data1 = res1.body;

    const res2 = await api.get(
      `${DESPATCH_ENDPOINT}/${data1.despatchAdviceId}`,
    );
    const data2 = res2.body;

    expect(res2.status).toBe(200);
    expect(data2).toMatchObject({
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
    });
    expect(data2.despatchAdviceId).toEqual(data1.despatchAdviceId);
  });

  it("returns 404 if no despatch advice was found for the given id", async () => {
    const res = await api.get(`${DESPATCH_ENDPOINT}/zzzzz111111`);
    const data = res.body;

    expect(res.status).toBe(404);
    expect(data.error).toEqual(expect.any(String));
  });

  it.todo("returns 403 if the delivery party does not have access to view doc");
});
