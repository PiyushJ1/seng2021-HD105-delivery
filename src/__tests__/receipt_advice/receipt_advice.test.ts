import request from "supertest";
import { describe, expect, test } from "vitest";

const BASE_URL = "http://localhost:3000";

describe("POST /receipt-advice", () => {

  const validBody = {
    despatchId: "DES123",
    deliveryPartyId: "DEL456",
    receivedDate: "2026-03-01",
    items: [
      {
        productId: "PROD1",
        quantityReceived: 50
      }
    ]
  };

  test("Creates receipt advice successfully", async () => {
    const res = await request(BASE_URL)
      .post("/api/receipt-advice")
      .send(validBody);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      receiptAdviceId: expect.any(String),
      status: expect.any(String),
      totalItemsReceived: 50
    });
  });

  test("Calculates totalItemsReceived correctly", async () => {
    const res = await request(BASE_URL)
      .post("/api/receipt-advice")
      .send({
        despatchId: "DES124",
        deliveryPartyId: "DEL456",
        receivedDate: "2026-03-01",
        items: [
          { productId: "PROD1", quantityReceived: 20 },
          { productId: "PROD2", quantityReceived: 30 }
        ]
      });

    expect(res.body.totalItemsReceived).toBe(50);
  });

  test("Returns 400 if fields missing", async () => {
    const res = await request(BASE_URL)
      .post("/api/receipt-advice")
      .send({
        deliveryPartyId: "DEL456"
      });

    expect(res.statusCode).toBe(400);
  });

  test("Returns 404 if despatch not found", async () => {
    const res = await request(BASE_URL)
      .post("/api/receipt-advice")
      .send({
        despatchId: "INVALID",
        deliveryPartyId: "DEL456",
        receivedDate: "2026-03-01",
        items: [
          { productId: "PROD1", quantityReceived: 50 }
        ]
      });

    expect(res.statusCode).toBe(404);
  });

  test("Returns 409 for duplicate receipt advice", async () => {
    await request(BASE_URL)
      .post("/api/receipt-advice")
      .send(validBody);

    const res = await request(BASE_URL)
      .post("/api/receipt-advice")
      .send(validBody);

    expect(res.statusCode).toBe(409);
  });

});