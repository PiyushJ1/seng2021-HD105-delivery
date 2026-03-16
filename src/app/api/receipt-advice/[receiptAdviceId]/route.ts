import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/src/lib/mongodb";
import { ReceiptItem } from "@/src/types";

/**
 * @openapi
 * /api/receipt-advice/{receiptAdviceId}:
 *   put:
 *     tags:
 *       - Receipt Advice
 *     summary: Update receipt advice items by ID
 *     parameters:
 *       - in: path
 *         name: receiptAdviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReceiptAdviceUpdateRequest'
 *     responses:
 *       200:
 *         description: Receipt advice updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptAdviceWriteResponse'
 *       400:
 *         description: Invalid payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Receipt advice or associated despatch not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     tags:
 *       - Receipt Advice
 *     summary: Get receipt advice by ID
 *     parameters:
 *       - in: path
 *         name: receiptAdviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receipt advice details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptAdvice'
 *       404:
 *         description: Receipt advice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ receiptAdviceId: string }> },
) {
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
      ? "test"
      : "production",
  );

  const receiptCollection = db.collection("receipt_advice");
  const despatchCollection = db.collection("despatch_advice");

  const resolvedParams = await params;
  const receiptAdviceId = resolvedParams.receiptAdviceId;

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !body.items ||
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    !body.items.every(
      (item: any) =>
        typeof item.productId === "string" &&
        typeof item.quantityReceived === "number",
    )
  ) {
    return NextResponse.json({ error: "Invalid update data" }, { status: 400 });
  }

  const existingReceipt = await receiptCollection.findOne({ receiptAdviceId });

  if (!existingReceipt) {
    return NextResponse.json(
      { error: "Receipt advice not found" },
      { status: 404 },
    );
  }

  const despatchDoc = await despatchCollection.findOne({
    despatchAdviceId: existingReceipt.despatchId,
  });

  if (!despatchDoc) {
    return NextResponse.json(
      { error: "Associated despatch not found" },
      { status: 404 },
    );
  }

  const totalItemsReceived = body.items.reduce(
    (sum: number, item: ReceiptItem) => sum + item.quantityReceived,
    0,
  );

  const totalItemsDespatched = despatchDoc.items.reduce(
    (sum: number, item: any) => sum + (item.quantity || 0),
    0,
  );

  const status =
    totalItemsReceived >= totalItemsDespatched ? "Complete" : "Partial";

  await receiptCollection.updateOne(
    { receiptAdviceId },
    {
      $set: {
        items: body.items,
        totalItemsReceived,
        status,
      },
    },
  );

  return NextResponse.json(
    {
      receiptAdviceId,
      status,
      totalItemsReceived,
    },
    { status: 200 },
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ receiptAdviceId: string }> },
) {
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
      ? "test"
      : "production",
  );

  const { receiptAdviceId } = await params;
  const receipt = await db
    .collection("receipt_advice")
    .findOne({ receiptAdviceId });

  if (!receipt) {
    return NextResponse.json(
      { error: "Receipt advice not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      receiptAdviceId: receipt.receiptAdviceId,
      deliveryPartyId: receipt.deliveryPartyId,
      status: receipt.status,
      items: receipt.items,
    },
    { status: 200 },
  );
}
