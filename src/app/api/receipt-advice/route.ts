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

  await receiptCollection.insertOne({
    receiptAdviceId,
    despatchId: body.despatchId,
    deliveryPartyId: body.deliveryPartyId,
    receivedDate: body.receivedDate,
    items: body.items,
    totalItemsReceived,
    status,
  });

  return NextResponse.json(
    {
      receiptAdviceId,
      status,
      totalItemsReceived,
    },
    { status: 200 },
  );
}
