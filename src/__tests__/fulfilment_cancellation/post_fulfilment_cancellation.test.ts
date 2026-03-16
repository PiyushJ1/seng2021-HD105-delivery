import { expect, describe, it, beforeEach, afterAll } from "vitest";
import { api } from "../utils";
import { MongoClient } from "mongodb";

const ENDPOINT = "/api/fulfilment-cancellation";
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("test");

beforeEach(async () => {
  await db.collection("despatchAdvices").deleteMany({});
  await db.collection("fulfilmentCancellations").deleteMany({});
});

afterAll(async () => {
  await client.close();
});

describe.skip("POST /api/fulfilment-cancellation", () => {
  it("Creates fulfilment cancellation successfully", async () => {
    await db.collection("despatchAdvices").insertOne({
      despatchAdviceId: "DES2001",
      items: [
        { productId: "prod1", quantityDespatched: 50 },
        { productId: "prod2", quantityDespatched: 20 },
      ],
    });

    const res = await api.post(ENDPOINT).send({
      despatchAdviceId: "DES2001",
      reason: "damaged goods in transit",
      cancellationDate: "2026-03-01",
      cancelledItems: [
        { productId: "prod1", quantityCancelled: 20, reasonCode: "DAMAGED" },
        {
          productId: "prod2",
          quantityCancelled: 10,
          reasonCode: "CUSTOMER_REQUEST",
        },
      ],
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      fulfilmentCancellationId: expect.any(String),
      status: "Created",
      despatchAdviceId: "DES2001",
    });
  });

  it("Returns 400 if fields are missing", async () => {
    const res = await api.post(ENDPOINT).send({ despatchAdviceId: "DES2001" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid or missing fields");
  });

  it("Returns 404 if despatchAdviceId is not found", async () => {
    const res = await api.post(ENDPOINT).send({
      despatchAdviceId: "DES404",
      cancellationDate: "2026-03-01",
      cancelledItems: [{ productId: "prod1", quantityCancelled: 20 }],
    });
    expect(res.status).toBe(404);
  });

  it("Returns 422 if quantityCancelled exceeds quantity despatched", async () => {
    await db.collection("despatchAdvices").insertOne({
      despatchAdviceId: "DES2001",
      items: [{ productId: "prod1", quantityDespatched: 50 }],
    });

    const res = await api.post(ENDPOINT).send({
      despatchAdviceId: "DES2001",
      cancellationDate: "2026-03-01",
      cancelledItems: [{ productId: "prod1", quantityCancelled: 60 }],
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toContain("exceeds quantity despatched");
  });

  it("Sums duplicate cancelledItems product quantities before validation", async () => {
    await db.collection("despatchAdvices").insertOne({
      despatchAdviceId: "DES2001",
      items: [{ productId: "prod1", quantityDespatched: 25 }],
    });

    const res = await api.post(ENDPOINT).send({
      despatchAdviceId: "DES2001",
      cancellationDate: "2026-03-01",
      cancelledItems: [
        { productId: "prod1", quantityCancelled: 20 },
        { productId: "prod1", quantityCancelled: 10 },
      ],
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toContain("exceeds quantity despatched");
  });
});
