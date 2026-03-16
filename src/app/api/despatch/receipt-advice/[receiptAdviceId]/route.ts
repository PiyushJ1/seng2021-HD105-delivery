import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/src/lib/mongodb";

/**
 * @openapi
 * /api/despatch/receipt-advice/{receiptAdviceId}:
 *   get:
 *     tags:
 *       - Receipt Advice
 *     summary: Get receipt advice details as viewed by despatch workflow
 *     parameters:
 *       - in: path
 *         name: receiptAdviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receipt advice details with delivery party flattened into each item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptAdviceDespatchViewResponse'
 *       404:
 *         description: Receipt advice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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

  const receiptCollection = db.collection("receipt_advice");

  const { receiptAdviceId } = await params;

  const receipt = await receiptCollection.findOne({ receiptAdviceId });

  if (!receipt) {
    return NextResponse.json(
      { error: "Receipt advice not found" },
      { status: 404 },
    );
  }

  const itemsWithDeliveryDetails = receipt.items.map((item: any) => ({
    productId: item.productId,
    deliveryPartyId: receipt.deliveryPartyId,
    quantityReceived: item.quantityReceived,
  }));

  return NextResponse.json(
    {
      receiptAdviceId: receipt.receiptAdviceId,
      despatchId: receipt.despatchId,
      status: receipt.status,
      items: itemsWithDeliveryDetails,
    },
    { status: 200 },
  );
}
