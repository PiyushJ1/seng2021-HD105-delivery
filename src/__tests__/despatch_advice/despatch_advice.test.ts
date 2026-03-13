import { expect, describe, it } from "vitest";
import request from "supertest";

const api = request("http://localhost:3000");

const VALID_REQUEST = {
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
    it("returns 200 with despatchAdviceId and despatch status for a valid request", async () => {
      const res = await api.post("/api/despatch-advice").send(VALID_REQUEST);
      const data = res.body;

      expect(res.status).toBe(200);

      expect(data).toHaveProperty("despatchAdviceId");
      expect(data.despatchAdviceId).toEqual(expect.any(String));

      expect(data).toHaveProperty("status");
      expect(data.status).toEqual(expect.any(String));
      expect(["Partial", "Complete"]).toContain(data.status);
    });
  });
});
