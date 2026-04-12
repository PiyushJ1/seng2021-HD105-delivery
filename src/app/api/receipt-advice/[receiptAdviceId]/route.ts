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
 *               $ref: '#/components/schemas/ReceiptAdviceUpdateBadRequestError'
 *       404:
 *         description: Receipt advice or associated despatch not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptAdviceUpdateNotFoundError'
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
 *               $ref: '#/components/schemas/ReceiptAdviceByIdNotFoundError'
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

  let invoiceId: string | null = null;
  if (status === "Complete" && !existingReceipt.invoiceId) {
    try {
      const invoice = await generateInvoice(body, despatchDoc);
      invoiceId = invoice.invoice?.invoice_id ?? null;
    } catch (err) {
      console.error("invoice generation failed:", err);
    }
  }

  await receiptCollection.updateOne(
    { receiptAdviceId },
    {
      $set: {
        items: body.items,
        totalItemsReceived,
        status,
        ...(invoiceId && { invoiceId }),
      },
    },
  );

  return NextResponse.json(
    {
      receiptAdviceId,
      status,
      totalItemsReceived,
      ...(invoiceId && { invoiceId }),
    },
    { status: 200 },
  );
}

async function generateInvoice(receiptAdvice: any, despatchAdvice: any) {
  const res = await fetch("https://lastminutepush.one/v1/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.INVOICE_API_KEY!,
    },
    body: JSON.stringify({
      order_reference: despatchAdvice.orderId,
      customer_id: despatchAdvice.deliveryPartyId,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000)
        .toISOString()
        .split("T")[0],
      currency: "AUD",
      supplier: {
        name: "Despatch Party",
        identifier: despatchAdvice.supplierPartyId,
      },
      customer: {
        name: "Delivery Party",
        identifier: despatchAdvice.deliveryPartyId,
      },
      items: receiptAdvice.items.map((item: any) => ({
        name: item.productId,
        description: `${item.productId} delivery`,
        quantity: item.quantityReceived,
        unit_price: 0, // placeholder for now
        unit_code: "EA",
      })),
    }),
  });

  return await res.json();
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
      ...(receipt.invoiceId && { invoiceId: receipt.invoiceId }),
    },
    { status: 200 },
  );
}
