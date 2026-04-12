import { NextResponse, NextRequest } from "next/server";
import { randomUUID } from "crypto";
import clientPromise from "@/src/lib/mongodb";

type ReceiptItem = {
  productId: string;
  quantityReceived: number;
};

type ReceiptAdviceRequest = {
  despatchId: string;
  deliveryPartyId: string;
  receivedDate: string;
  items: ReceiptItem[];
};

/**
 * @openapi
 * /api/receipt-advice:
 *   get:
 *     tags:
 *       - Receipt Advice
 *     summary: Search receipt advices by productId
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Matching receipt records for product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReceiptAdviceSearchResult'
 *       400:
 *         description: Missing productId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptAdviceSearchBadRequestError'
 *       404:
 *         description: No receipt found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptAdviceSearchNotFoundError'
 *   post:
 *     tags:
 *       - Receipt Advice
 *     summary: Create a receipt advice for a despatch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReceiptAdviceCreateRequest'
 *     responses:
 *       200:
 *         description: Receipt advice created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptAdviceWriteResponse'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptAdviceCreateBadRequestError'
 *       404:
 *         description: Despatch not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptAdviceCreateNotFoundError'
 *       409:
 *         description: Duplicate receipt advice for despatch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptAdviceCreateConflictError'
 */

export async function GET(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
      ? "test"
      : "production",
  );

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "Missing productId parameter" },
      { status: 400 },
    );
  }

  const receipts = await db
    .collection("receipt_advice")
    .find({ "items.productId": productId })
    .toArray();

  if (receipts.length === 0) {
    return NextResponse.json({ error: "No receipt found" }, { status: 404 });
  }

  const response = receipts.map((receipt) => {
    const item = receipt.items.find((i: any) => i.productId === productId);
    return {
      receiptAdviceId: receipt.receiptAdviceId,
      quantityReceived: item ? item.quantityReceived : 0,
      receivedDate: receipt.receivedDate,
    };
  });

  return NextResponse.json(response, { status: 200 });
}

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
      ? "test"
      : "production",
  );

  const receiptCollection = db.collection("receipt_advice");
  const despatchCollection = db.collection("despatch_advice");

  const body: ReceiptAdviceRequest = await req.json();

  if (
    typeof body.despatchId !== "string" ||
    typeof body.deliveryPartyId !== "string" ||
    typeof body.receivedDate !== "string" ||
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    !body.items.every(
      (item) =>
        typeof item.productId === "string" &&
        typeof item.quantityReceived === "number",
    )
  ) {
    return NextResponse.json(
      { error: "Invalid or missing fields" },
      { status: 400 },
    );
  }

  const despatchDoc = await despatchCollection.findOne({
    despatchAdviceId: body.despatchId,
  });

  if (!despatchDoc || !Array.isArray(despatchDoc.items)) {
    return NextResponse.json(
      { error: "Despatch not found or invalid despatch data" },
      { status: 404 },
    );
  }

  const existingReceipt = await receiptCollection.findOne({
    despatchId: body.despatchId,
  });

  if (existingReceipt) {
    return NextResponse.json(
      { error: "Duplicate receipt advice" },
      { status: 409 },
    );
  }

  const totalItemsReceived = body.items.reduce(
    (sum, item) => sum + item.quantityReceived,
    0,
  );

  const totalItemsDespatched = despatchDoc.items.reduce(
    (sum: number, item: any) => sum + (item.quantity || 0),
    0,
  );

  const status =
    totalItemsReceived >= totalItemsDespatched ? "Complete" : "Partial";

  const receiptAdviceId = randomUUID();

  let invoiceId: string | null = null;
  if (status === "Complete") {
    try {
      const invoice = await generateInvoice(body, despatchDoc);
      invoiceId = invoice.invoice?.invoice_id ?? null;
    } catch (err) {
      console.error("invoice generation failed:", err);
    }
  }

  await receiptCollection.insertOne({
    receiptAdviceId,
    despatchId: body.despatchId,
    deliveryPartyId: body.deliveryPartyId,
    receivedDate: body.receivedDate,
    items: body.items,
    totalItemsReceived,
    status,
    ...(invoiceId && { invoiceId }),
  });

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

async function generateInvoice(
  receiptAdvice: ReceiptAdviceRequest,
  despatchAdvice: any,
) {
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
      items: receiptAdvice.items.map((item) => ({
        name: item.productId,
        description: `${item.productId} delivery`,
        quantity: item.quantityReceived,
        unit_price: 0,
        unit_code: "EA",
      })),
    }),
  });

  return await res.json();
}
