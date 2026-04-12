import clientPromise from "@/src/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ receiptAdviceId: string }>;
  },
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

  if (!receipt.invoiceId) {
    return NextResponse.json(
      { error: "This receipt does not have an invoice generated" },
      { status: 404 },
    );
  }

  const res = await fetch(
    `https://lastminutepush.one/v1/invoices/${receipt.invoiceId}`,
    {
      method: "GET",
      headers: {
        "X-API-Key": process.env.INVOICE_API_KEY!,
      },
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "There was a server error fetching the invoice" },
      { status: res.status },
    );
  }

  return NextResponse.json(await res.json(), { status: 200 });
}
