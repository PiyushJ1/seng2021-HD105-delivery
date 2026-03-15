import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";
import { getAuth } from "@/src/lib/auth";

type InventoryAdjustmentLine = {
  sku: string;
  uom?: string;
  quantityReceived: number;
};

type ReceiptAdviceDocument = {
  receiptAdviceId: string;
  receivedDate?: string | Date;
  inventoryUpdateApplied?: boolean;
  lifecycleState?: string;
  status?: string;
  items: InventoryAdjustmentLine[];
};

type InventoryDocument = {
  warehouseId: string;
  binId: string;
  sku: string;
  uom?: string;
  onHand: number;
  available: number;
  updatedAt: string;
};

const NOT_FOUND =
  "receipt advice ID, warehouse ID or bin ID not found" as const;

/** RFC 4122 UUID (any version). */
function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id.trim(),
  );
}

/** Looks like a UUID shape (8-4-4-4-12 hex) but may be invalid. */
function looksLikeUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id.trim(),
  );
}

function toIsoSecondZ(d: Date): string {
  const s = d.toISOString();
  return s.includes(".") ? `${s.slice(0, s.indexOf("."))}Z` : s;
}

function normaliseLines(lines: InventoryAdjustmentLine[]): InventoryAdjustmentLine[] {
  const merged = new Map<string, InventoryAdjustmentLine>();

  for (const line of lines) {
    const key = `${line.sku}::${line.uom ?? ""}`;
    const existing = merged.get(key);

    if (existing) {
      existing.quantityReceived += line.quantityReceived;
    } else {
      merged.set(key, {
        sku: line.sku,
        uom: line.uom,
        quantityReceived: line.quantityReceived,
      });
    }
  }

  return [...merged.values()];
}

// PUT /supply/inventory-updates/{receiptAdviceId}
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ receiptAdviceId: string }> },
) {
  const authHeader = req.headers.get("authorization")?.trim();
  if (!authHeader) {
    return NextResponse.json(
      { error: "missing auth token" },
      { status: 401 },
    );
  }

  const auth = await getAuth(req);
  if (!auth) {
    return NextResponse.json(
      { error: "missing auth token" },
      { status: 401 },
    );
  }

  if (auth.role !== "despatch_party") {
    return NextResponse.json(
      { error: "Not authorised" },
      { status: 403 },
    );
  }

  const { receiptAdviceId: receiptAdviceIdParam } = await context.params;
  const receiptAdviceId = receiptAdviceIdParam?.trim() ?? "";

  if (!receiptAdviceId) {
    return NextResponse.json(
      { error: "missing receiptAdviceId" },
      { status: 400 },
    );
  }

  if (looksLikeUuid(receiptAdviceId) && !isValidUuid(receiptAdviceId)) {
    return NextResponse.json({ error: "bad UUID format" }, { status: 400 });
  }

  let body: {
    warehouseId?: string;
    binId?: string;
    inventoryAdjustmentLines?: InventoryAdjustmentLine[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid or missing fields" },
      { status: 400 },
    );
  }

  const warehouseId = body.warehouseId?.trim();
  const binId = body.binId?.trim();
  const inventoryAdjustmentLines = body.inventoryAdjustmentLines;

  if (!warehouseId) {
    return NextResponse.json(
      { error: "missing warehouseId" },
      { status: 400 },
    );
  }

  if (looksLikeUuid(warehouseId) && !isValidUuid(warehouseId)) {
    return NextResponse.json({ error: "bad UUID format" }, { status: 400 });
  }

  if (!binId) {
    return NextResponse.json({ error: "missing binId" }, { status: 400 });
  }

  if (looksLikeUuid(binId) && !isValidUuid(binId)) {
    return NextResponse.json({ error: "bad UUID format" }, { status: 400 });
  }

  if (
    !Array.isArray(inventoryAdjustmentLines) ||
    inventoryAdjustmentLines.length === 0
  ) {
    return NextResponse.json({ error: "empty lines" }, { status: 400 });
  }

  for (const line of inventoryAdjustmentLines) {
    if (!line?.sku?.trim()) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 },
      );
    }

    if (
      typeof line.quantityReceived !== "number" ||
      Number.isNaN(line.quantityReceived) ||
      !Number.isFinite(line.quantityReceived)
    ) {
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

  const requestLines = normaliseLines(
    inventoryAdjustmentLines.map((line) => ({
      sku: line.sku.trim(),
      uom: line.uom?.trim() || undefined,
      quantityReceived: line.quantityReceived,
    })),
  );

  const client = await clientPromise;
  const db = client.db();

  const receiptAdvices = db.collection<ReceiptAdviceDocument>("receiptAdvices");
  const warehouses = db.collection("warehouses");
  const bins = db.collection("bins");
  const inventory = db.collection<InventoryDocument>("inventory");

  const receiptAdvice = await receiptAdvices.findOne({
    receiptAdviceId,
  });

  if (!receiptAdvice) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }

  if (receiptAdvice.inventoryUpdateApplied) {
    return NextResponse.json(
      { error: "receipt already applied" },
      { status: 409 },
    );
  }

  const receiptState = (
    receiptAdvice.lifecycleState ??
    receiptAdvice.status ??
    ""
  ).toLowerCase();

  if (["cancelled", "void", "rejected"].includes(receiptState)) {
    return NextResponse.json(
      { error: "receipt advice not in a state that can be applied" },
      { status: 409 },
    );
  }

  const warehouse = await warehouses.findOne({ warehouseId });
  if (!warehouse) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }

  const bin = await bins.findOne({ warehouseId, binId });
  if (!bin) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }

  const receiptLines = normaliseLines(
    (receiptAdvice.items ?? []).map((line) => ({
      sku: line.sku.trim(),
      uom: line.uom?.trim() || undefined,
      quantityReceived: line.quantityReceived,
    })),
  );

  const receiptBySku = new Map<string, InventoryAdjustmentLine>();
  for (const line of receiptLines) {
    receiptBySku.set(line.sku, line);
  }

  for (const line of requestLines) {
    const receiptLine = receiptBySku.get(line.sku);

    if (!receiptLine) {
      return NextResponse.json(
        { error: "invalid SKU or UoM mismatch" },
        { status: 422 },
      );
    }

    if (line.uom && receiptLine.uom && line.uom !== receiptLine.uom) {
      return NextResponse.json(
        { error: "invalid SKU or UoM mismatch" },
        { status: 422 },
      );
    }

    if (line.quantityReceived > receiptLine.quantityReceived) {
      return NextResponse.json(
        { error: "received quantity exceeds allowed qty" },
        { status: 422 },
      );
    }
  }

  const positionsUpdated: InventoryDocument[] = [];

  for (const line of requestLines) {
    const updatedAtZ = toIsoSecondZ(new Date());

    await inventory.updateOne(
      {
        warehouseId,
        binId,
        sku: line.sku,
      },
      {
        $setOnInsert: {
          warehouseId,
          binId,
          sku: line.sku,
          onHand: 0,
          available: 0,
        },
        $set: {
          updatedAt: updatedAtZ,
          ...(line.uom ? { uom: line.uom } : {}),
        },
        $inc: {
          onHand: line.quantityReceived,
          available: line.quantityReceived,
        },
      },
      { upsert: true },
    );

    const updatedRow = await inventory.findOne({
      warehouseId,
      binId,
      sku: line.sku,
    });

    if (updatedRow) {
      positionsUpdated.push({
        warehouseId: updatedRow.warehouseId,
        binId: updatedRow.binId,
        sku: updatedRow.sku,
        uom: updatedRow.uom,
        onHand: updatedRow.onHand,
        available: updatedRow.available,
        updatedAt: updatedRow.updatedAt.includes(".")
          ? `${updatedRow.updatedAt.slice(0, updatedRow.updatedAt.indexOf("."))}Z`
          : String(updatedRow.updatedAt),
      });
    }
  }

  const appliedAtFormatted = toIsoSecondZ(new Date());

  await receiptAdvices.updateOne(
    { receiptAdviceId },
    {
      $set: {
        inventoryUpdateApplied: true,
        inventoryUpdateAppliedAt: appliedAtFormatted,
        appliedWarehouseId: warehouseId,
        appliedBinId: binId,
      },
    },
  );

  return NextResponse.json(
    {
      receiptAdviceId,
      applied: true,
      appliedAt: appliedAtFormatted,
      positionsUpdated,
    },
    { status: 200 },
  );
}
