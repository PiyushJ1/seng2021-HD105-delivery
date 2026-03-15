import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { MongoClient } from "mongodb";
import { api, DESPATCH_ENDPOINT, VALID_DESPATCH_REQUEST } from "../utils";

const client = new MongoClient(process.env.MONGODB_URI!);
const collection = client.db("test").collection("despatch_advice");

beforeEach(async () => {
  await collection.deleteMany({});
});

afterAll(async () => {
  await client.close();
});

describe("GET /despatch-advice/:despatchAdviceId", () => {
  it("returns 200 with details for a specific despatch advice doc", async () => {
    const res1 = await api.post(DESPATCH_ENDPOINT).send(VALID_DESPATCH_REQUEST);
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
