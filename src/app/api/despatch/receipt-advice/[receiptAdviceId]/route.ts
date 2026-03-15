import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/src/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ receiptAdviceId: string }> }
) {
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
      ? "test"
      : "production"
  );

  const receiptCollection = db.collection("receipt_advice");

  const { receiptAdviceId } = await params;

  const receipt = await receiptCollection.findOne({ receiptAdviceId });

  if (!receipt) {
    return NextResponse.json(
      { error: "Receipt advice not found" },
      { status: 404 }
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
    { status: 200 }
  );
}