import { expect, describe, it } from "vitest";
import request from "supertest";

const api = request("http://localhost:3000");
const DESPATCH_ENDPOINT = "/api/despatch-advice";

const VALID_DESPATCH_REQUEST = {
  orderId: "abc123",
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

describe("despatch advice tests", () => {
  describe("POST /despatch_advice", () => {
    // happy path
    it("returns 200 with despatchAdviceId and despatch status for a valid request", async () => {
      const res = await api
        .post(DESPATCH_ENDPOINT)
        .send(VALID_DESPATCH_REQUEST);
      const data = res.body;

      expect(res.status).toBe(200);

      expect(data).toHaveProperty("despatchAdviceId");
      expect(data.despatchAdviceId).toEqual(expect.any(String));

      expect(data).toHaveProperty("status");
      expect(data.status).toEqual(expect.any(String));
      expect(["Partial", "Complete"]).toContain(data.status);
    });

    // error cases:
    it("returns 400 if the fields are invalid", async () => {
      const req = {
        orderId: 1,
        supplierPartyId: 2,
        deliveryPartyId: 3,
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

      expect(res.status).toBe(400);

      expect(data).toHaveProperty("error");
      expect(data.error).toEqual(expect.any(String));
    });

    it("returns 400 if required fields are missing", async () => {
      const req = {
        orderId: "abc123",
      };

      const res = await api.post(DESPATCH_ENDPOINT).send(req);
      const data = res.body;

      expect(res.status).toBe(400);

      expect(data).toHaveProperty("error");
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

      expect(data).toHaveProperty("error");
      expect(data.error).toEqual(expect.any(String));
    });

    it("returns 404 if the orderId is not found", async () => {
      const res = await api
        .post(DESPATCH_ENDPOINT)
        .send(VALID_DESPATCH_REQUEST);
      const data = res.body;

      expect(res.status).toBe(404);

      expect(data).toHaveProperty("error");
      expect(data.error).toEqual(expect.any(String));
    });

    it("returns 409 if the despatch advice doc already exists for the order", async () => {
      const res1 = await api
        .post(DESPATCH_ENDPOINT)
        .send(VALID_DESPATCH_REQUEST);
      expect(res1.status).toBe(200);

      const res2 = await api
        .post(DESPATCH_ENDPOINT)
        .send(VALID_DESPATCH_REQUEST);
      const data = res2.body;

      expect(res2.status).toBe(409);

      expect(data).toHaveProperty("error");
      expect(data.error).toEqual(expect.any(String));
    });

    it("returns 422 if there is a logic error (quantity > items in inventory)", async () => {
      const req = {
        orderId: "abc123",
        supplierPartyId: "abc123",
        deliveryPartyId: "abc123",
        despatchDate: "2026-03-01",
        items: [
          {
            productId: "prod1",
            quantity: 999999,
          },
          {
            productId: "prod2",
            quantity: 100000,
          },
        ],
      };

      const res = await api.post(DESPATCH_ENDPOINT).send(req);
      const data = res.body;

      expect(res.status).toBe(422);

      expect(data).toHaveProperty("error");
      expect(data.error).toEqual(expect.any(String));
    });
  });

  describe("GET /despatch-advice", () => {
    it("returns 200 with despatch advice doc details for a valid request", async () => {
      const res = await api.get(DESPATCH_ENDPOINT);
      const data = res.body;

      expect(res.status).toBe(200);
      expect(data).toMatchObject({
        despatchAdvices: expect.arrayContaining([
          {
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
          },
        ]),
      });
    });

    it.todo(
      "returns 404 if a despatch advice does not exist for the requesting party",
    );
  });

  describe("GET /despatch-advice/:despatchAdviceId", () => {
    it("returns 200 with details for a specific despatch advice doc", async () => {
      const res1 = await api
        .post(DESPATCH_ENDPOINT)
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
      expect(data1.despatchAdviceId).toEqual(data2.despatchAdviceId);
    });

    it("returns 404 if no despatch advice was found for the given id", async () => {
      const res = await api.get(`${DESPATCH_ENDPOINT}/zzzzz111111`);
      const data = res.body;

      expect(res.status).toBe(404);

      expect(data).toHaveProperty("error");
      expect(data.error).toEqual(expect.any(String));
    });
  });
});
