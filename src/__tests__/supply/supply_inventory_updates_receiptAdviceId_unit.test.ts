import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFindOne, mockUpdateOne, mockInsertOne, mockGetAuth } = vi.hoisted(
  () => ({
    mockFindOne: vi.fn(),
    mockUpdateOne: vi.fn(),
    mockInsertOne: vi.fn(),
    mockGetAuth: vi.fn(),
  }),
);

vi.mock("@/src/lib/mongodb", () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: mockFindOne,
        updateOne: mockUpdateOne,
        insertOne: mockInsertOne,
      }),
    }),
  }),
}));

vi.mock("@/src/lib/auth", () => ({
  getAuth: mockGetAuth,
}));

function putRequest(
  receiptAdviceId: string,
  body: Record<string, unknown>,
  auth = true,
) {
  return new NextRequest(
    `http://localhost/api/supply/inventory-updates/${receiptAdviceId}`,
    {
      method: "PUT",
      headers: auth
        ? { Authorization: "Bearer x", "Content-Type": "application/json" }
        : { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

function mockFindOneChain(opts: {
  receipt: Record<string, unknown> | null;
  warehouse: Record<string, unknown> | null;
  bin: Record<string, unknown> | null;
  inventoryRows?: Record<string, unknown>[];
}) {
  const inv = opts.inventoryRows ?? [];
  let invIdx = 0;
  mockFindOne.mockImplementation((q: Record<string, unknown>) => {
    if ("receiptAdviceId" in q && !("sku" in q)) {
      return Promise.resolve(opts.receipt);
    }
    if ("warehouseId" in q && "binId" in q && "sku" in q) {
      const row = inv[invIdx] ?? null;
      invIdx += 1;
      return Promise.resolve(row);
    }
    if ("warehouseId" in q && "binId" in q) {
      return Promise.resolve(opts.bin);
    }
    if ("warehouseId" in q) {
      return Promise.resolve(opts.warehouse);
    }
    return Promise.resolve(null);
  });
}

describe("PUT /supply/inventory-updates/{receiptAdviceId} (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuth.mockResolvedValue({ role: "despatch_party" });
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  });

  it("returns 401 when auth token is missing", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    const req = putRequest(
      "RA1",
      {
        warehouseId: "W-1",
        binId: "B-1",
        inventoryAdjustmentLines: [
          { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
        ],
      },
      false,
    );
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA1" }),
    });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "missing auth token" });
  });

  it.skip("returns 403 when user is not despatch_party", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    mockGetAuth.mockResolvedValue({ role: "delivery_party" });
    const req = putRequest("RA1", {
      warehouseId: "W-1",
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
      ],
    });
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA1" }),
    });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Not authorised" });
  });

  it("returns 400 when warehouseId is missing", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    const req = putRequest("RA1", {
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
      ],
    });
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA1" }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "missing warehouseId" });
  });

  it("returns 400 when lines are empty", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    const req = putRequest("RA1", {
      warehouseId: "W-1",
      binId: "B-1",
      inventoryAdjustmentLines: [],
    });
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA1" }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "empty lines" });
  });

  it("returns 400 when quantityReceived is negative", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    const req = putRequest("RA1", {
      warehouseId: "W-1",
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityReceived: -1 },
      ],
    });
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA1" }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "negative quantityReceived" });
  });

  it("returns 400 when warehouseId has bad UUID format", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    const req = putRequest("RA1", {
      warehouseId: "550e8400-e29b-71d4-a716-446655440000",
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
      ],
    });
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA1" }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "bad UUID format" });
  });

  it("returns 404 when receipt advice, warehouse or bin not found", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    mockFindOneChain({
      receipt: null,
      warehouse: null,
      bin: null,
    });
    const req = putRequest("RA404", {
      warehouseId: "W-1",
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
      ],
    });
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA404" }),
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "receipt advice ID, warehouse ID or bin ID not found",
    });
  });

  it("returns 409 when receipt is already applied", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    mockFindOne.mockImplementation((q: Record<string, unknown>) => {
      if ("receiptAdviceId" in q && !("sku" in q)) {
        return Promise.resolve({
          receiptAdviceId: "RA1",
          inventoryUpdateApplied: true,
          items: [{ sku: "SKU-001", quantityReceived: 10 }],
        });
      }
      return Promise.resolve(null);
    });
    const req = putRequest("RA1", {
      warehouseId: "W-1",
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
      ],
    });
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA1" }),
    });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "receipt already applied" });
  });

  it("returns 409 when receipt advice is not in applicable state", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    mockFindOne.mockImplementation((q: Record<string, unknown>) => {
      if ("receiptAdviceId" in q && !("sku" in q)) {
        return Promise.resolve({
          receiptAdviceId: "RA1",
          status: "cancelled",
          items: [{ sku: "SKU-001", quantityReceived: 10 }],
        });
      }
      return Promise.resolve({});
    });
    const req = putRequest("RA1", {
      warehouseId: "W-1",
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityReceived: 10 },
      ],
    });
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA1" }),
    });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      error: "receipt advice not in a state that can be applied",
    });
  });

  it("returns 422 when SKU is invalid or UoM mismatch", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    mockFindOneChain({
      receipt: {
        receiptAdviceId: "RA1",
        items: [{ sku: "SKU-001", uom: "EA", quantityReceived: 10 }],
      },
      warehouse: { warehouseId: "W-1" },
      bin: { warehouseId: "W-1", binId: "B-1" },
    });
    const req = putRequest("RA1", {
      warehouseId: "W-1",
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "BAD", uom: "EA", quantityReceived: 5 },
      ],
    });
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA1" }),
    });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: "invalid SKU or UoM mismatch",
    });
  });

  it("returns 422 when received quantity exceeds allowed", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    mockFindOneChain({
      receipt: {
        receiptAdviceId: "RA1",
        items: [{ sku: "SKU-001", uom: "EA", quantityReceived: 10 }],
      },
      warehouse: { warehouseId: "W-1" },
      bin: { warehouseId: "W-1", binId: "B-1" },
    });
    const req = putRequest("RA1", {
      warehouseId: "W-1",
      binId: "B-1",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityReceived: 99 },
      ],
    });
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA1" }),
    });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: "received quantity exceeds allowed qty",
    });
  });

  it("returns 200 and applies inventory update successfully", async () => {
    const { PUT } =
      await import("../../app/api/supply/inventory-updates/[receiptAdviceId]/route");
    mockFindOneChain({
      receipt: {
        receiptAdviceId: "RA12345",
        items: [{ sku: "SKU-001", uom: "EA", quantityReceived: 50 }],
      },
      warehouse: { warehouseId: "WH-7" },
      bin: { warehouseId: "WH-7", binId: "A1-03-02" },
      inventoryRows: [
        {
          warehouseId: "WH-7",
          binId: "A1-03-02",
          sku: "SKU-001",
          uom: "EA",
          onHand: 50,
          available: 50,
          updatedAt: "2026-02-28T21:16:11Z",
        },
      ],
    });
    const req = putRequest("RA12345", {
      warehouseId: "WH-7",
      binId: "A1-03-02",
      inventoryAdjustmentLines: [
        { sku: "SKU-001", uom: "EA", quantityReceived: 50 },
      ],
    });
    const res = await PUT(req, {
      params: Promise.resolve({ receiptAdviceId: "RA12345" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.receiptAdviceId).toBe("RA12345");
    expect(body.applied).toBe(true);
    expect(body.appliedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(body.positionsUpdated).toHaveLength(1);
    expect(body.positionsUpdated[0].sku).toBe("SKU-001");
    expect(mockUpdateOne).toHaveBeenCalled();
  });
});
