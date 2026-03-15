import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";
import { getAuth } from "@/src/lib/auth";

type CancelledItem = {
  productId: string;
  quantityCancelled: number;
  reasonCode?: string;
};

type DespatchAdviceItem = {
  productId: string;
  quantityDespatched?: number;
  quantity?: number;
};

type DespatchAdviceDocument = {
  despatchAdviceId: string;
  items: DespatchAdviceItem[];
};

type FulfilmentCancellationDocument = {
  fulfilmentCancellationId: string;
  status: "Created";
  despatchAdviceId: string;
  cancellationDate: string;
  cancelledItems: CancelledItem[];
  reason?: string;
};

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function generateFulfilmentCancellationId(): string {
  return `FC${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

function getDespatchedQuantity(item: DespatchAdviceItem): number {
  if (typeof item.quantityDespatched === "number") {
    return item.quantityDespatched;
  }

  if (typeof item.quantity === "number") {
    return item.quantity;
  }

  return 0;
}

// POST /fulfilment-cancellation
export async function POST(req: NextRequest) {
    const auth = await getAuth(req);
  
    if (!auth || auth.role !== "despatch_party") {
      return NextResponse.json(
        { error: "Not authorized to create fulfilment cancellation document" },
        { status: 403 },
      );
    }
  
    let body: {
      despatchAdviceId?: string;
      cancellationDate?: string;
      cancelledItems?: CancelledItem[];
      reason?: string;
    };
  
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 },
      );
    }
  
    const despatchAdviceId = body.despatchAdviceId?.trim();
    const cancellationDate = body.cancellationDate?.trim();
    const cancelledItems = body.cancelledItems;
    const reason = body.reason?.trim();
  
    if (
      !despatchAdviceId ||
      !cancellationDate ||
      !Array.isArray(cancelledItems) ||
      cancelledItems.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 },
      );
    }
  
    if (!isValidDateString(cancellationDate)) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 },
      );
    }
  
    for (const item of cancelledItems) {
      if (
        !item?.productId?.trim() ||
        typeof item.quantityCancelled !== "number" ||
        !Number.isFinite(item.quantityCancelled) ||
        item.quantityCancelled <= 0
      ) {
        return NextResponse.json(
          { error: "Invalid or missing fields" },
          { status: 400 },
        );
      }
    }
  
    const client = await clientPromise;
    const db = client.db();
  
    const despatchAdvices =
      db.collection<DespatchAdviceDocument>("despatchAdvices");
    const fulfilmentCancellations =
      db.collection<FulfilmentCancellationDocument>("fulfilmentCancellations");
  
    const despatchAdvice = await despatchAdvices.findOne({ despatchAdviceId });
  
    if (!despatchAdvice) {
      return NextResponse.json(
        { error: "despatchAdviceId not found" },
        { status: 404 },
      );
    }
  
    const existingCancellation = await fulfilmentCancellations.findOne({
      despatchAdviceId,
    });
  
    if (existingCancellation) {
      return NextResponse.json(
        {
          error:
            "Fulfilment cancellation document already exists for this despatchAdviceId",
        },
        { status: 409 },
      );
    }
  
    const despatchedByProduct = new Map<string, number>();
  
    for (const item of despatchAdvice.items ?? []) {
      const productId = item.productId?.trim();
      if (!productId) continue;
  
      const quantity = getDespatchedQuantity(item);
      despatchedByProduct.set(
        productId,
        (despatchedByProduct.get(productId) ?? 0) + quantity,
      );
    }
  
    const cancelledByProduct = new Map<string, number>();
  
    for (const item of cancelledItems) {
      const productId = item.productId.trim();
      cancelledByProduct.set(
        productId,
        (cancelledByProduct.get(productId) ?? 0) + item.quantityCancelled,
      );
    }
  
    for (const [productId, quantityCancelled] of cancelledByProduct.entries()) {
      const quantityDespatched = despatchedByProduct.get(productId);
  
      if (quantityDespatched === undefined) {
        return NextResponse.json(
          { error: `productId not in despatch advice: ${productId}` },
          { status: 422 },
        );
      }
  
      if (quantityCancelled > quantityDespatched) {
        return NextResponse.json(
          {
            error: `quantityCancelled exceeds quantity despatched for productId: ${productId}`,
          },
          { status: 422 },
        );
      }
    }
  
    const fulfilmentCancellationId = generateFulfilmentCancellationId();
  
    await fulfilmentCancellations.insertOne({
      fulfilmentCancellationId,
      status: "Created",
      despatchAdviceId,
      cancellationDate,
      cancelledItems: cancelledItems.map((item) => ({
        productId: item.productId.trim(),
        quantityCancelled: item.quantityCancelled,
        reasonCode: item.reasonCode?.trim() || undefined,
      })),
      ...(reason ? { reason } : {}),
    });
  
    return NextResponse.json(
      {
        fulfilmentCancellationId,
        status: "Created",
        despatchAdviceId,
      },
      { status: 200 },
    );
  }