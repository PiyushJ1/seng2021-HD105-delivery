import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import clientPromise from "@/src/lib/mongodb";

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db("test");

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid or missing fields" }, { status: 400 });
  }

  const { despatchAdviceId, cancellationDate, cancelledItems, reason } = body;

  if (
    !despatchAdviceId?.trim() ||
    !cancellationDate?.trim() ||
    !Array.isArray(cancelledItems) ||
    cancelledItems.length === 0 ||
    !isValidDateString(cancellationDate)
  ) {
    return NextResponse.json({ error: "Invalid or missing fields" }, { status: 400 });
  }

  for (const item of cancelledItems) {
    if (
      !item?.productId?.trim() ||
      typeof item.quantityCancelled !== "number" ||
      item.quantityCancelled <= 0
    ) {
      return NextResponse.json({ error: "Invalid or missing fields" }, { status: 400 });
    }
  }

  const despatchAdvice = await db.collection("despatchAdvices").findOne({ despatchAdviceId });
  if (!despatchAdvice) {
    return NextResponse.json({ error: "despatchAdviceId not found" }, { status: 404 });
  }

  const existingCancellation = await db.collection("fulfilmentCancellations").findOne({ despatchAdviceId });
  if (existingCancellation) {
    return NextResponse.json(
      { error: "Fulfilment cancellation document already exists for this despatchAdviceId" },
      { status: 409 }
    );
  }

  const despatchedByProduct = new Map<string, number>();
  (despatchAdvice.items || []).forEach((item: any) => {
    const qty = item.quantityDespatched ?? item.quantity ?? 0;
    despatchedByProduct.set(item.productId, (despatchedByProduct.get(item.productId) || 0) + qty);
  });

  const cancelledByProduct = new Map<string, number>();
  for (const item of cancelledItems) {
    const productId = item.productId.trim();
    const qtyDespatched = despatchedByProduct.get(productId);
    
    if (qtyDespatched === undefined) {
      return NextResponse.json({ error: `productId not in despatch advice: ${productId}` }, { status: 422 });
    }
    
    const currentTotal = (cancelledByProduct.get(productId) || 0) + item.quantityCancelled;
    cancelledByProduct.set(productId, currentTotal);
  }

  for (const [productId, totalCancelled] of cancelledByProduct.entries()) {
    if (totalCancelled > (despatchedByProduct.get(productId) || 0)) {
      return NextResponse.json(
        { error: `quantityCancelled exceeds quantity despatched for productId: ${productId}` },
        { status: 422 }
      );
    }
  }

  const fulfilmentCancellationId = `FC${randomUUID()}`;
  await db.collection("fulfilmentCancellations").insertOne({
    fulfilmentCancellationId,
    status: "Created",
    despatchAdviceId,
    cancellationDate,
    cancelledItems: cancelledItems.map(item => ({
      productId: item.productId.trim(),
      quantityCancelled: item.quantityCancelled,
      reasonCode: item.reasonCode?.trim()
    })),
    reason: reason?.trim()
  });

  return NextResponse.json({ fulfilmentCancellationId, status: "Created", despatchAdviceId }, { status: 200 });
}
