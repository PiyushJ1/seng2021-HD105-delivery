import request from "supertest";
import { describe, expect, test } from "vitest";

const BASE_URL = "http://localhost:3000";

function generateId() {
    return "RA-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

describe.skip("PUT /receipt-advices/:receiptAdviceId", () => {

    test("Updates receipt advice successfully", async () => {

        const receiptAdviceId = generateId();

        const res = await request(BASE_URL)
        .put(`/receipt-advices/${receiptAdviceId}`)
        .send({
            items: [
            {
                productId: "PROD1",
                quantityReceived: 80
            }
            ]
        });

        expect(res.status).toBe(200);
        expect(res.body.receiptAdviceId).toBe(receiptAdviceId);
        expect(res.body.status).toBeDefined();
        expect(res.body.totalItemsReceived).toBe(80);

    });

    test("Returns 400 when items missing", async () => {

        const receiptAdviceId = generateId();

        const res = await request(BASE_URL)
        .put(`/receipt-advices/${receiptAdviceId}`)
        .send({});

        expect(res.status).toBe(400);

    });

    test("Returns 400 for invalid quantity", async () => {

        const receiptAdviceId = generateId();

        const res = await request(BASE_URL)
        .put(`/receipt-advices/${receiptAdviceId}`)
        .send({
            items: [
            {
                productId: "PROD1",
                quantityReceived: -5
            }
            ]
        });

        expect(res.status).toBe(400);

    });

    test("Returns 404 when receipt advice not found", async () => {

        const res = await request(BASE_URL)
        .put(`/receipt-advices/NON_EXISTENT`)
        .send({
            items: [
            {
                productId: "PROD1",
                quantityReceived: 50
            }
            ]
        });

        expect(res.status).toBe(404);

    });
});
