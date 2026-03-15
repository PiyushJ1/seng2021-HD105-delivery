import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api, DESPATCH_ENDPOINT, VALID_DESPATCH_REQUEST } from "../utils";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const collection = client.db("test").collection("despatch_advice");

beforeEach(async () => {
  await collection.deleteMany({});
});

afterAll(async () => {
  await client.close();
});

describe("POST /despatch-advice", () => {
  // happy path
  it("returns 200 with despatchAdviceId and despatch status for a valid request", async () => {
    const res = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
    const data = res.body;

    expect(res.status).toBe(200);

    expect(data).toHaveProperty("despatchAdviceId");
    expect(data.despatchAdviceId).toEqual(expect.any(String));

    expect(data).toHaveProperty("status");
    expect(data.status).toEqual(expect.any(String));
    expect(["Partial", "Complete"]).toContain(data.status);
  });

  // error cases
  it("returns 400 if the fields are invalid", async () => {
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

    const res = await api.post(DESPATCH_ENDPOINT).send(req);
    const data = res.body;

    expect(res.status).toBe(400);
    expect(data.error).toEqual(expect.any(String));
  });

  it("returns 400 if required fields are missing", async () => {
    const req = { orderId: "abc123" };

    const res = await api.post(DESPATCH_ENDPOINT).send(req);
    const data = res.body;

    expect(res.status).toBe(400);
    expect(data.error).toEqual(expect.any(String));
  });

  it("returns 400 if the items array is empty", async () => {
    const req = {
      orderId: "abc123",
      supplierPartyId: "abc123",
      deliveryPartyId: "abc123",
      despatchDate: "2026-03-01",
      items: [],
    };

    const res = await api.post(DESPATCH_ENDPOINT).send(req);
    const data = res.body;

    expect(res.status).toBe(400);
    expect(data.error).toEqual(expect.any(String));
  });

  it("returns 404 if the orderId is not found", async () => {
    const req = {
      orderId: "hello123",
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
    const res = await api.post(DESPATCH_ENDPOINT).send(req);
    const data = res.body;

    expect(res.status).toBe(404);
    expect(data.error).toEqual(expect.any(String));
  });

  it.skip("returns 409 if the despatch advice doc already exists for the order", async () => {
    const res1 = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
    expect(res1.status).toBe(200);

    const res2 = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
    const data = res2.body;

    expect(res2.status).toBe(409);
    expect(data.error).toEqual(expect.any(String));
  });

  it("returns 422 if there is a logic error (quantity > items in inventory)", async () => {
    const req = {
      orderId: "abc123",
      supplierPartyId: "abc123",
      deliveryPartyId: "abc123",
      despatchDate: "2026-03-01",
      items: [
        { productId: "prod1", quantity: 999999 },
        { productId: "prod2", quantity: 100000 },
      ],
    };

    const res = await api.post(DESPATCH_ENDPOINT).send(req);
    const data = res.body;

    expect(res.status).toBe(422);
    expect(data.error).toEqual(expect.any(String));
  });
});
