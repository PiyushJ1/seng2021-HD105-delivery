import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fulfilmentCancelationId: string }> },
) {
  const resolvedParams = await params;
  const id = resolvedParams.fulfilmentCancelationId?.trim();

  if (!id || id === "" || id === "  ") {
    return NextResponse.json(
      { error: "Invalid fulfilmentCancellationId format" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db("test");

  const doc = await db.collection("fulfilmentCancellations").findOne({
    fulfilmentCancellationId: id,
  });

  if (!doc) {
    return NextResponse.json(
      { error: "Fulfilment cancellation document not found" },
      { status: 404 },
    );
  }

  const despatchAdvice = await db.collection("despatchAdvices").findOne({
    despatchAdviceId: doc.despatchAdviceId,
  });

  return NextResponse.json(
    {
      fulfilmentCancellationId: doc.fulfilmentCancellationId,
      despatchAdviceId: doc.despatchAdviceId,
      supplierPartyId:
        doc.supplierPartyId ?? despatchAdvice?.supplierPartyId ?? "",
      deliveryPartyId:
        doc.deliveryPartyId ?? despatchAdvice?.deliveryPartyId ?? "",
      cancellationDate: doc.cancellationDate,
      cancellationReason: doc.reason ?? "",
      status: doc.status,
      cancelledItems: (doc.cancelledItems ?? []).map((item: any) => ({
        productId: item.productId,
        quantityCancelled: item.quantityCancelled,
        ...(item.reasonCode ? { reasonCode: item.reasonCode } : {}),
      })),
    },
    { status: 200 },
  );
}
