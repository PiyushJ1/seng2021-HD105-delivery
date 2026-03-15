import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";
import { getAuth } from "@/src/lib/auth";

type ReceiptAdviceItem = {
  productId: string;
  quantityReceived: number;
};

type ReceiptAdviceDocument = {
  receiptAdviceId: string;
  receivedDate: string | Date;
  items: ReceiptAdviceItem[];
};

type ReceiptAdviceResponse = {
  receiptAdviceId: string;
  quantityReceived: number;
  receivedDate: string;
};

function formatDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

// GET /receipt-advices?productId={productId}
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId")?.trim();

  if (!productId) {
    return NextResponse.json(
      { error: "Missing productId parameter" },
      { status: 400 },
    );
  }

  const auth = await getAuth(req);
  if (!auth || auth.role !== "despatch_party") {
    return NextResponse.json(
      { error: "Not authorised to view" },
      { status: 403 },
    );
  }

  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<ReceiptAdviceDocument>("receiptAdvices");

  const documents = await collection
    .find(
      { "items.productId": productId },
      {
        projection: {
          _id: 0,
          receiptAdviceId: 1,
          receivedDate: 1,
          items: 1,
        },
      },
    )
    .sort({ receivedDate: 1, receiptAdviceId: 1 })
    .toArray();

  const results: ReceiptAdviceResponse[] = documents
    .map((doc) => {
      const quantityReceived = doc.items
        .filter((item) => item.productId === productId)
        .reduce((sum, item) => sum + item.quantityReceived, 0);

      return {
        receiptAdviceId: doc.receiptAdviceId,
        quantityReceived,
        receivedDate: formatDate(doc.receivedDate),
      };
    })
    .filter((doc) => doc.quantityReceived > 0);

  if (results.length === 0) {
    return NextResponse.json({ error: "No receipt found" }, { status: 404 });
  }

  return NextResponse.json(results, { status: 200 });
}