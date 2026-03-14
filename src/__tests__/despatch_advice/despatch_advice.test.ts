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
  });

  describe("GET /despatch-advice", () => {});

  describe("GET /despatch-advice/:despatchAdviceId", () => {});
});
