import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";
import { getAuth } from "@/src/lib/auth";

type CancelledItem = {
  productId: string;
  quantityCancelled: number;
  reasonCode?: string;
};

type FulfilmentCancellationDocument = {
  fulfilmentCancellationId: string;
  despatchAdviceId: string;
  status: string;
  cancellationDate: string;
  cancelledItems: CancelledItem[];
  reason?: string;
  deliveryPartyId?: string;
  supplierPartyId?: string;
};

type DespatchAdviceDocument = {
  despatchAdviceId: string;
  supplierPartyId?: string;
  deliveryPartyId?: string;
};

/** Invalid if empty or whitespace-only. */
function isValidFulfilmentCancellationId(id: string): boolean {
  return typeof id === "string" && id.trim().length > 0;
}

// GET /fulfilment-cancellations/{fulfilmentCancellationId}
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ fulfilmentCancellationId: string }> },
) {
  const auth = await getAuth(req);
  if (!auth) {
    return NextResponse.json(
      { error: "Not authorised to access this fulfilment cancellation document" },
      { status: 403 },
    );
  }

  const { fulfilmentCancellationId: fulfilmentCancellationIdParam } =
    await context.params;
  const fulfilmentCancellationId =
    fulfilmentCancellationIdParam?.trim() ?? "";

  if (!isValidFulfilmentCancellationId(fulfilmentCancellationId)) {
    return NextResponse.json(
      { error: "Invalid fulfilmentCancellationId format" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db();

  const fulfilmentCancellations =
    db.collection<FulfilmentCancellationDocument>("fulfilmentCancellations");
  const despatchAdvices =
    db.collection<DespatchAdviceDocument>("despatchAdvices");

  const doc = await fulfilmentCancellations.findOne(
    { fulfilmentCancellationId },
    {
      projection: {
        _id: 0,
        fulfilmentCancellationId: 1,
        despatchAdviceId: 1,
        status: 1,
        cancellationDate: 1,
        cancelledItems: 1,
        reason: 1,
        deliveryPartyId: 1,
        supplierPartyId: 1,
      },
    },
  );

  if (!doc) {
    return NextResponse.json(
      { error: "Fulfilment cancellation document not found" },
      { status: 404 },
    );
  }

  const despatchAdvice = doc.despatchAdviceId
    ? await despatchAdvices.findOne(
        { despatchAdviceId: doc.despatchAdviceId },
        { projection: { supplierPartyId: 1, deliveryPartyId: 1 } },
      )
    : null;

  const supplierPartyId =
    doc.supplierPartyId ?? despatchAdvice?.supplierPartyId ?? "";
  const deliveryPartyId =
    doc.deliveryPartyId ?? despatchAdvice?.deliveryPartyId ?? "";

  // Delivery parties can only access documents where they are the deliveryPartyId
  if (auth.role === "delivery_party") {
    if (auth.orgId !== deliveryPartyId) {
      return NextResponse.json(
        {
          error:
            "Not authorised to access this fulfilment cancellation document",
        },
        { status: 403 },
      );
    }
  }

  return NextResponse.json(
    {
      fulfilmentCancellationId: doc.fulfilmentCancellationId,
      despatchAdviceId: doc.despatchAdviceId,
      supplierPartyId,
      deliveryPartyId,
      cancellationDate: doc.cancellationDate,
      cancellationReason: doc.reason ?? "",
      status: doc.status,
      cancelledItems: (doc.cancelledItems ?? []).map((item) => ({
        productId: item.productId,
        quantityCancelled: item.quantityCancelled,
        ...(item.reasonCode ? { reasonCode: item.reasonCode } : {}),
      })),
    },
    { status: 200 },
  );
}
