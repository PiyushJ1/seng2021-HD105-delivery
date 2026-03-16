import request from "supertest";

export const api = request("http://localhost:3000");
export const DESPATCH_ENDPOINT = "/api/despatch-advice";

export const VALID_DESPATCH_REQUEST = {
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

export const SUPPLY_INVENTORY_ENDPOINT = "/api/supply/inventory-updates";
