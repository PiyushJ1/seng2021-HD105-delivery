import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AdjustmentLine = {
  sku: string;
  uom?: string;
  quantityCancelled: number;
};

type FulfilmentCancellationItem = {
  sku: string;
  uom?: string;
  quantityCancelled: number;
};

export async function PUT(
  req: NextRequest,
  { params }: { params?: Promise<{ fulfilmentCancellationId?: string }> },
) {
  // Await params for App Router
  const resolvedParams = params ? await params : {};
  const fulfilmentCancellationId =
    resolvedParams.fulfilmentCancellationId ??
    req.nextUrl.pathname.split("/").pop();

  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "missing auth token" },
      { status: 401 },
    );
  }

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
    if (!line.sku || typeof line.quantityCancelled !== "number") {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 },
      );
    }

    if (line.quantityCancelled < 0) {
      return NextResponse.json(
        { error: "negative quantityCancelled" },
        { status: 400 },
      );
    }
  }

  if (warehouseId.includes("-") && !UUID_V4_RE.test(warehouseId)) {
    const parts = warehouseId.split("-");
    if (parts.length === 5) {
      return NextResponse.json({ error: "bad UUID format" }, { status: 400 });
    }
  }

  const client = await clientPromise;
  const db = client.db("test");

  // Fetch fulfilment cancellation
  const cancellation = await db
    .collection("fulfilmentCancellations")
    .findOne({ fulfilmentCancellationId });

  if (!cancellation) {
    return NextResponse.json(
      { error: "fulfilment cancellation not found" },
      { status: 404 },
    );
  }

  if (cancellation.inventoryUpdateApplied) {
    return NextResponse.json(
      { error: "cancellation already applied" },
      { status: 409 },
    );
  }

  const validStates = [undefined, "requested", "approved"];
  if (cancellation.status && !validStates.includes(cancellation.status)) {
    return NextResponse.json(
      { error: "cancellation not in a state that can be applied" },
      { status: 409 },
    );
  }

  const warehouse = await db
    .collection("warehouses")
    .findOne({ warehouseId });

  const bin = await db
    .collection("bins")
    .findOne({ warehouseId, binId });

  if (!warehouse || !bin) {
    return NextResponse.json(
      { error: "fulfilment cancellation ID, warehouse ID or bin ID not found" },
      { status: 404 },
    );
  }

  // Map existing items
  const cancellationItems: FulfilmentCancellationItem[] =
    cancellation.items ?? [];
  const itemsBySku = new Map<string, { totalQty: number; uom?: string }>();
  for (const item of cancellationItems) {
    const existing = itemsBySku.get(item.sku);
    itemsBySku.set(item.sku, {
      totalQty: (existing?.totalQty ?? 0) + item.quantityCancelled,
      uom: item.uom ?? existing?.uom,
    });
  }

  // Validate SKU & quantity
  for (const line of inventoryAdjustmentLines) {
    const match = itemsBySku.get(line.sku);
    if (!match) {
      return NextResponse.json(
        { error: "SKU not in cancellation" },
        { status: 422 },
      );
    }

    if (line.uom && match.uom && line.uom !== match.uom) {
      return NextResponse.json(
        { error: "invalid SKU or UoM mismatch" },
        { status: 422 },
      );
    }

    if (line.quantityCancelled > match.totalQty) {
      return NextResponse.json(
        { error: "cancelled quantity exceeds allowed qty" },
        { status: 422 },
      );
    }
  }

  const appliedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const positionsUpdated: Record<string, unknown>[] = [];

  // Apply cancellation
  for (const line of inventoryAdjustmentLines) {
    const uom = line.uom ?? itemsBySku.get(line.sku)?.uom ?? "EA";

    const existingRow = await db.collection("inventory").findOne({
      warehouseId,
      binId,
      sku: line.sku,
    });

    if (existingRow) {
      const newOnHand = (existingRow.onHand ?? 0) - line.quantityCancelled;
      const newAvailable =
        (existingRow.available ?? 0) - line.quantityCancelled;

      await db.collection("inventory").updateOne(
        { warehouseId, binId, sku: line.sku },
        {
          $set: { onHand: newOnHand, available: newAvailable, updatedAt: appliedAt },
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
      // If SKU not in inventory, set to 0 minus cancelled
      await db.collection("inventory").insertOne({
        warehouseId,
        binId,
        sku: line.sku,
        uom,
        onHand: -line.quantityCancelled,
        available: -line.quantityCancelled,
        updatedAt: appliedAt,
      });

      positionsUpdated.push({
        warehouseId,
        binId,
        sku: line.sku,
        uom,
        onHand: -line.quantityCancelled,
        available: -line.quantityCancelled,
        updatedAt: appliedAt,
      });
    }
  }

  await db.collection("fulfilmentCancellations").updateOne(
    { fulfilmentCancellationId },
    { $set: { inventoryUpdateApplied: true } },
  );

  return NextResponse.json({
    fulfilmentCancellationId,
    applied: true,
    appliedAt,
    positionsUpdated,
  });
}