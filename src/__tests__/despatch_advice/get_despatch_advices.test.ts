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

describe("GET /despatch-advice", () => {
  it("returns 200 with despatch advice doc details for a valid request", async () => {
    // send two despatch creation requests
    await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
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
    await api.post(DESPATCH_ENDPOINT).send(req);

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
