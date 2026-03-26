import { NextRequest, NextResponse } from "next/server";

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AdjustmentLine = {
  sku: string;
  uom?: string;
  quantityReceived: number;
};

type ReceiptItem = {
  sku: string;
  uom?: string;
  quantityReceived: number;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ receiptAdviceId: string }> },
) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid or missing fields" },
      { status: 400 },
    );
  }

  const { warehouseId, binId, inventoryAdjustmentLines } = body as {
    warehouseId?: string;
    binId?: string;
    inventoryAdjustmentLines?: AdjustmentLine[];
  };

  if (!warehouseId) {
    return NextResponse.json({ error: "missing warehouseId" }, { status: 400 });
  }

  if (!binId) {
    return NextResponse.json({ error: "missing binId" }, { status: 400 });
  }

  if (
    !Array.isArray(inventoryAdjustmentLines) ||
    inventoryAdjustmentLines.length === 0
  ) {
    return NextResponse.json({ error: "empty lines" }, { status: 400 });
  }

  for (const line of inventoryAdjustmentLines) {
    if (!line.sku || typeof line.quantityReceived !== "number") {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 },
      );
    }
    if (line.quantityReceived < 0) {
      return NextResponse.json(
        { error: "negative quantityReceived" },
        { status: 400 },
      );
    }
  }

  if (UUID_V4_RE.test(warehouseId) === false && warehouseId.includes("-")) {
    const parts = warehouseId.split("-");
    if (parts.length === 5) {
      return NextResponse.json({ error: "bad UUID format" }, { status: 400 });
    }
  }

  const { default: clientPromise } = await import("@/src/lib/mongodb");
  const client = await clientPromise;
  const db = client.db();

  const { receiptAdviceId } = await params;

  const receipt = await db
    .collection("receiptAdvices")
    .findOne({ receiptAdviceId });

  if (!receipt) {
    return NextResponse.json(
      { error: "receipt advice ID, warehouse ID or bin ID not found" },
      { status: 404 },
    );
  }

  if (receipt.inventoryUpdateApplied) {
    return NextResponse.json(
      { error: "receipt already applied" },
      { status: 409 },
    );
  }

  const validStates = [undefined, "received", "accepted"];
  if (receipt.status && !validStates.includes(receipt.status)) {
    return NextResponse.json(
      { error: "receipt advice not in a state that can be applied" },
      { status: 409 },
    );
  }

  const warehouse = await db.collection("warehouses").findOne({ warehouseId });
  const bin = await db.collection("bins").findOne({ warehouseId, binId });

  if (!warehouse || !bin) {
    return NextResponse.json(
      { error: "receipt advice ID, warehouse ID or bin ID not found" },
      { status: 404 },
    );
  }

  const receiptItems: ReceiptItem[] = receipt.items ?? [];
  const receiptBySku = new Map<string, { totalQty: number; uom?: string }>();
  for (const item of receiptItems) {
    const existing = receiptBySku.get(item.sku);
    receiptBySku.set(item.sku, {
      totalQty: (existing?.totalQty ?? 0) + item.quantityReceived,
      uom: item.uom ?? existing?.uom,
    });
  }

  for (const line of inventoryAdjustmentLines) {
    const match = receiptBySku.get(line.sku);
    if (!match) {
      return NextResponse.json(
        { error: "invalid SKU or UoM mismatch" },
        { status: 422 },
      );
    }
    if (line.uom && match.uom && line.uom !== match.uom) {
      return NextResponse.json(
        { error: "invalid SKU or UoM mismatch" },
        { status: 422 },
      );
    }
    if (line.quantityReceived > match.totalQty) {
      return NextResponse.json(
        { error: "received quantity exceeds allowed qty" },
        { status: 422 },
      );
    }
  }

  const appliedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const positionsUpdated: Record<string, unknown>[] = [];

  for (const line of inventoryAdjustmentLines) {
    const uom = line.uom ?? receiptBySku.get(line.sku)?.uom ?? "EA";

    const existingRow = await db.collection("inventory").findOne({
      warehouseId,
      binId,
      sku: line.sku,
    });

    if (existingRow) {
      const newOnHand = (existingRow.onHand ?? 0) + line.quantityReceived;
      const newAvailable = (existingRow.available ?? 0) + line.quantityReceived;
      await db.collection("inventory").updateOne(
        { warehouseId, binId, sku: line.sku },
        {
          $set: {
            onHand: newOnHand,
            available: newAvailable,
            updatedAt: appliedAt,
          },
        },
      );
      positionsUpdated.push({
        warehouseId,
        binId,
        sku: line.sku,
        uom,
        onHand: newOnHand,
        available: newAvailable,
        updatedAt: appliedAt,
      });
    } else {
      await db.collection("inventory").insertOne({
        warehouseId,
        binId,
        sku: line.sku,
        uom,
        onHand: line.quantityReceived,
        available: line.quantityReceived,
        updatedAt: appliedAt,
      });
      positionsUpdated.push({
        warehouseId,
        binId,
        sku: line.sku,
        uom,
        onHand: line.quantityReceived,
        available: line.quantityReceived,
        updatedAt: appliedAt,
      });
    }
  }

  await db
    .collection("receiptAdvices")
    .updateOne({ receiptAdviceId }, { $set: { inventoryUpdateApplied: true } });

  return NextResponse.json({
    receiptAdviceId,
    applied: true,
    appliedAt,
    positionsUpdated,
  });
}
