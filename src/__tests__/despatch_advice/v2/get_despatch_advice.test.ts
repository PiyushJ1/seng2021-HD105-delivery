import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { MongoClient } from "mongodb";
import { api, DESPATCH_ENDPOINT_V2, VALID_DESPATCH_REQUEST } from "../../utils";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");
const despatchCollection = db.collection("despatch_advice");
const usersCollection = db.collection("users");

const despatchUser = {
  email: "despatch.user@example.com",
  password: "despatch-password",
  role: "despatch",
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
  await despatchCollection.deleteMany({});
  await usersCollection.deleteMany({ email: despatchUser.email });
});

afterAll(async () => {
  await client.close();
});

describe("GET /despatch-advice/:despatchAdviceId", () => {
  it("returns 200 with details for a specific despatch advice doc", async () => {
    const { headers, partyId } = await authHeaders(despatchUser);

    const res1 = await api
      .post(DESPATCH_ENDPOINT_V2)
      .set(headers)
      .send({ ...VALID_DESPATCH_REQUEST, supplierPartyId: partyId });
    const data1 = res1.body;

    const res2 = await api
      .get(`${DESPATCH_ENDPOINT_V2}/${data1.despatchAdviceId}`)
      .set(headers);
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
    const { headers } = await authHeaders(despatchUser);

    const res = await api
      .get(`${DESPATCH_ENDPOINT_V2}/zzzzz111111`)
      .set(headers);
    const data = res.body;

    expect(res.status).toBe(404);
    expect(data.error).toEqual(expect.any(String));
  });

  it("returns 403 if the delivery party does not have access to view doc", async () => {
    const headers1 = await authHeaders(despatchUser);
    const res1 = await api
      .post(DESPATCH_ENDPOINT_V2)
      .set(headers1.headers)
      .send({ ...VALID_DESPATCH_REQUEST, supplierPartyId: headers1.partyId });
    const data1 = res1.body;

    const headers2 = await authHeaders(deliveryUser);
    const res2 = await api
      .get(`${DESPATCH_ENDPOINT_V2}/${data1.despatchAdviceId}`)
      .set(headers2.headers);
    const data2 = res2.body;

    expect(res2.status).toBe(403);
    expect(data2.error).toEqual(expect.any(String));
  });
});
