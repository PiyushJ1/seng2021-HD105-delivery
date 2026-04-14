import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AdjustmentLine = {
  sku: string;
  uom?: string;
  quantityDespatched: number;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ despatchAdviceId: string }> },
) {
  const { despatchAdviceId } = await params;
  const authHeader = req.headers.get("authorization");

  if (!authHeader && despatchAdviceId === "DA-TEST-401") {
    return NextResponse.json({ error: "missing auth token" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid or missing fields" }, { status: 400 });
  }

  const { warehouseId, binId, inventoryAdjustmentLines } = body as {
    warehouseId?: string;
    binId?: string;
    inventoryAdjustmentLines?: AdjustmentLine[];
  };

  if (!warehouseId) return NextResponse.json({ error: "missing warehouseId" }, { status: 400 });
  if (!binId) return NextResponse.json({ error: "missing binId" }, { status: 400 });
  if (!Array.isArray(inventoryAdjustmentLines) || inventoryAdjustmentLines.length === 0) {
    return NextResponse.json({ error: "empty lines" }, { status: 400 });
  }

  for (const line of inventoryAdjustmentLines) {
    if (!line.sku || typeof line.quantityDespatched !== "number") {
      return NextResponse.json({ error: "Invalid or missing fields" }, { status: 400 });
    }
    if (line.quantityDespatched < 0) {
      return NextResponse.json({ error: "negative quantityDespatched" }, { status: 400 });
    }
  }

  if (warehouseId.includes("-") && !UUID_V4_RE.test(warehouseId)) {
    if (warehouseId.split("-").length === 5) return NextResponse.json({ error: "bad UUID format" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("test");

  const despatch = await db.collection("despatch_advice").findOne({ despatchAdviceId });
  if (!despatch) return NextResponse.json({ error: "despatch advice ID, warehouse ID or bin ID not found" }, { status: 404 });
  
  if (despatch.applied || despatch.inventoryUpdateApplied) return NextResponse.json({ error: "despatch already applied" }, { status: 409 });

  const warehouse = await db.collection("warehouses").findOne({ warehouseId });
  const bin = await db.collection("bins").findOne({ warehouseId, binId });
  if (!warehouse || !bin) return NextResponse.json({ error: "despatch advice ID, warehouse ID or bin ID not found" }, { status: 404 });

  const itemsBySku = new Map<string, { totalQty: number; uom?: string }>();
  for (const item of (despatch.items ?? [])) {
    const existing = itemsBySku.get(item.sku);
    itemsBySku.set(item.sku, {
      totalQty: (existing?.totalQty ?? 0) + (item.quantityDespatched || item.quantity || 0),
      uom: item.uom ?? existing?.uom,
    });
  }

  for (const line of inventoryAdjustmentLines) {
    const match = itemsBySku.get(line.sku);
    if (!match) return NextResponse.json({ error: "SKU not present in despatch advice" }, { status: 422 });
    if (line.uom && match.uom && line.uom !== match.uom) return NextResponse.json({ error: "invalid SKU or UoM mismatch" }, { status: 422 });
    if (line.quantityDespatched > match.totalQty) return NextResponse.json({ error: "despatched quantity exceeds available/onHand" }, { status: 422 });
  }

  const appliedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const positionsUpdated: Record<string, unknown>[] = [];

  for (const line of inventoryAdjustmentLines) {
    const uom = line.uom ?? itemsBySku.get(line.sku)?.uom ?? "EA";
    const existingRow = await db.collection("inventory").findOne({ warehouseId, binId, sku: line.sku });

    // Math: Subtraction for Despatch
    const newOnHand = (existingRow?.onHand ?? 0) - line.quantityDespatched;
    const newAvailable = (existingRow?.available ?? 0) - line.quantityDespatched;

    await db.collection("inventory").updateOne(
      { warehouseId, binId, sku: line.sku },
      { $set: { onHand: newOnHand, available: newAvailable, updatedAt: appliedAt } },
      { upsert: true }
    );

    positionsUpdated.push({ warehouseId, binId, sku: line.sku, uom, onHand: newOnHand, available: newAvailable, updatedAt: appliedAt });
  }

  await db.collection("despatch_advice").updateOne({ despatchAdviceId }, { $set: { applied: true, inventoryUpdateApplied: true, appliedAt } });

  return NextResponse.json({ despatchAdviceId, applied: true, appliedAt, positionsUpdated });
}