import { expect, describe, it } from "vitest";
import { api, DESPATCH_ENDPOINT } from "../utils";

describe("GET /despatch-advice", () => {
  it("returns 200 with despatch advice doc details for a valid request", async () => {
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
