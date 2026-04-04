import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api, DESPATCH_ENDPOINT_V2, VALID_DESPATCH_REQUEST } from "../../utils";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const despatchCollection = client.db("test").collection("despatch_advice");
const usersCollection = client.db("test").collection("users");

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

async function register(email: string, password: string, role: string) {
  await api.post("/api/auth/register").send({ email, password, role });
}

async function login(email: string, password: string) {
  const res = await api.post("/api/auth/login").send({ email, password });
  return res.body.apiKey as string;
}

async function authHeaders() {
  await register(despatchUser.email, despatchUser.password, despatchUser.role);
  const apiKey = await login(despatchUser.email, despatchUser.password);
  const user = await usersCollection.findOne({ email: despatchUser.email });
  const partyId = user!.partyId as string;
  return { headers: { apiKey }, partyId };
}

beforeEach(async () => {
  await despatchCollection.deleteMany({});
  await usersCollection.deleteMany({
    email: { $in: [despatchUser.email, deliveryUser.email] },
  });
});

afterAll(async () => {
  await client.close();
});

describe("POST /despatch-advice", () => {
  it("returns 200 with despatchAdviceId and despatch status for a valid request", async () => {
    const { headers, partyId } = await authHeaders();

    const res = await api
      .post(DESPATCH_ENDPOINT_V2)
      .set(headers)
      .send({ ...VALID_DESPATCH_REQUEST, supplierPartyId: partyId });
    const data = res.body;

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("despatchAdviceId");
    expect(data.despatchAdviceId).toEqual(expect.any(String));
    expect(data).toHaveProperty("status");
    expect(["Partial", "Complete"]).toContain(data.status);
  });

  it("returns 400 if the fields are invalid", async () => {
    const { headers } = await authHeaders();
    const req = {
      orderId: 1,
      supplierPartyId: 2,
      deliveryPartyId: 3,
      despatchDate: "2026-03-01",
      items: [
        { productId: "prod1", quantity: 10 },
        { productId: "prod2", quantity: 20 },
      ],
    };

    const res = await api.post(DESPATCH_ENDPOINT_V2).set(headers).send(req);
    const data = res.body;

    expect(res.status).toBe(400);
    expect(data.error).toEqual(expect.any(String));
  });

  it("returns 400 if required fields are missing", async () => {
    const { headers } = await authHeaders();
    const req = { orderId: "abc123" };

    const res = await api.post(DESPATCH_ENDPOINT_V2).set(headers).send(req);
    const data = res.body;

    expect(res.status).toBe(400);
    expect(data.error).toEqual(expect.any(String));
  });

  it("returns 400 if the items array is empty", async () => {
    const { headers } = await authHeaders();
    const req = {
      orderId: "abc123",
      supplierPartyId: "abc123",
      deliveryPartyId: "abc123",
      despatchDate: "2026-03-01",
      items: [],
    };

    const res = await api.post(DESPATCH_ENDPOINT_V2).set(headers).send(req);
    const data = res.body;

    expect(res.status).toBe(400);
    expect(data.error).toEqual(expect.any(String));
  });

  it("returns 404 if the orderId is not found", async () => {
    const { headers, partyId } = await authHeaders();
    const req = {
      orderId: "hello123",
      supplierPartyId: partyId,
      deliveryPartyId: "abc123",
      despatchDate: "2026-03-01",
      items: [
        { productId: "prod1", quantity: 10 },
        { productId: "prod2", quantity: 20 },
      ],
    };

    const res = await api.post(DESPATCH_ENDPOINT_V2).set(headers).send(req);
    const data = res.body;

    expect(res.status).toBe(404);
    expect(data.error).toEqual(expect.any(String));
  });

  it("returns 409 if the despatch advice doc already exists for the order", async () => {
    const { headers, partyId } = await authHeaders();
    const req = { ...VALID_DESPATCH_REQUEST, supplierPartyId: partyId };

    const res1 = await api.post(DESPATCH_ENDPOINT_V2).set(headers).send(req);
    expect(res1.status).toBe(200);

    const res2 = await api.post(DESPATCH_ENDPOINT_V2).set(headers).send(req);
    const data = res2.body;

    expect(res2.status).toBe(409);
    expect(data.error).toEqual(expect.any(String));
  });

  it("returns 422 if there is a logic error (quantity > items in inventory)", async () => {
    const { headers, partyId } = await authHeaders();
    const req = {
      orderId: "abc123",
      supplierPartyId: partyId,
      deliveryPartyId: "abc123",
      despatchDate: "2026-03-01",
      items: [
        { productId: "prod1", quantity: 999999 },
        { productId: "prod2", quantity: 100000 },
      ],
    };

    const res = await api.post(DESPATCH_ENDPOINT_V2).set(headers).send(req);
    const data = res.body;

    expect(res.status).toBe(422);
    expect(data.error).toEqual(expect.any(String));
  });

  it("returns 401 if the api key is missing", async () => {
    const res = await api
      .post(DESPATCH_ENDPOINT_V2)
      .send(VALID_DESPATCH_REQUEST);
    expect(res.status).toBe(401);
  });

  it("returns 403 if the api key belongs to a delivery party", async () => {
    await register(
      deliveryUser.email,
      deliveryUser.password,
      deliveryUser.role,
    );
    const apiKey = await login(deliveryUser.email, deliveryUser.password);

    const res = await api
      .post(DESPATCH_ENDPOINT_V2)
      .set({ apiKey })
      .send(VALID_DESPATCH_REQUEST);

    expect(res.status).toBe(403);
  });
});
