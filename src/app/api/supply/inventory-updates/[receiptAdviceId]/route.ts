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

// PUT /supply/inventory-updates/[receiptAdviceId]
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

  const { receiptAdviceId } = await context.params;

  if (!receiptAdviceId?.trim()) {
    return NextResponse.json(
      { error: "missing receiptAdviceId" },
      { status: 400 },
    );
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
      { error: "invalid JSON body" },
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

  if (!binId) {
    return NextResponse.json(
      { error: "missing binId" },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(inventoryAdjustmentLines) ||
    inventoryAdjustmentLines.length === 0
  ) {
    return NextResponse.json(
      { error: "inventoryAdjustmentLines must be a non-empty array" },
      { status: 400 },
    );
  }

  for (const line of inventoryAdjustmentLines) {
    if (!line?.sku?.trim()) {
      return NextResponse.json(
        { error: "Each inventoryAdjustmentLine must include a sku" },
        { status: 400 },
      );
    }

    if (
      typeof line.quantityReceived !== "number" ||
      Number.isNaN(line.quantityReceived) ||
      !Number.isFinite(line.quantityReceived)
    ) {
      return NextResponse.json(
        {
          error:
            "Each inventoryAdjustmentLine must include a valid quantityReceived",
        },
        { status: 400 },
      );
    }

    if (line.quantityReceived < 0) {
      return NextResponse.json(
        { error: "quantityReceived cannot be negative" },
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
    receiptAdviceId: receiptAdviceId.trim(),
  });

  if (!receiptAdvice) {
    return NextResponse.json(
      { error: "receipt advice ID not found" },
      { status: 404 },
    );
  }

  if (receiptAdvice.inventoryUpdateApplied) {
    return NextResponse.json(
      { error: "receipt advice already applied" },
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
    return NextResponse.json(
      { error: "warehouse ID not found" },
      { status: 404 },
    );
  }

  const bin = await bins.findOne({ warehouseId, binId });
  if (!bin) {
    return NextResponse.json(
      { error: "bin ID not found" },
      { status: 404 },
    );
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
        { error: `invalid SKU: ${line.sku}` },
        { status: 422 },
      );
    }

    if (line.uom && receiptLine.uom && line.uom !== receiptLine.uom) {
      return NextResponse.json(
        { error: `UoM mismatch for SKU: ${line.sku}` },
        { status: 422 },
      );
    }

    if (line.quantityReceived > receiptLine.quantityReceived) {
      return NextResponse.json(
        {
          error: `received quantity exceeds allowed quantity for SKU: ${line.sku}`,
        },
        { status: 422 },
      );
    }
  }

  const appliedAt = new Date().toISOString();
  const positionsUpdated: InventoryDocument[] = [];

  for (const line of requestLines) {
    const updatedAt = new Date().toISOString();

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
          updatedAt,
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
        updatedAt: updatedRow.updatedAt,
      });
    }
  }

  await receiptAdvices.updateOne(
    { receiptAdviceId: receiptAdviceId.trim() },
    {
      $set: {
        inventoryUpdateApplied: true,
        inventoryUpdateAppliedAt: appliedAt,
        appliedWarehouseId: warehouseId,
        appliedBinId: binId,
      },
    },
  );

  return NextResponse.json(
    {
      receiptAdviceId: receiptAdviceId.trim(),
      applied: true,
      appliedAt,
      positionsUpdated,
    },
    { status: 200 },
  );
}
