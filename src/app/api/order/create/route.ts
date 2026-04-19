import clientPromise from "@/src/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "development" ? "test" : "production",
  );
  const users = db.collection("users");
  const orders = db.collection("orders");

  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const user = await users.findOne({ apiKey });

  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await req.json();

  const buyerEmail =
    body.buyerEmail ?? body.buyer_customer_party?.contact?.email;
  const sellerEmail =
    body.sellerEmail ?? body.seller_customer_party?.contact?.email;

  if (buyerEmail !== user.email && sellerEmail !== user.email) {
    return NextResponse.json(
      { error: "Your email must be buyer or seller" },
      { status: 403 },
    );
  }

  const orderId = "OL-001";
  const now = new Date().toISOString();
  const buyerName =
    body.buyer_customer_party?.name ?? "Widget Wholesale Pty Ltd";

  const ublXml = `<?xml version="1.0" encoding="UTF-8"?>
    <Order>
      <ID>${orderId}</ID>
      <Buyer>${buyerName}</Buyer>
      <Status>CREATED</Status>
    </Order>`;

  const orderRecord = {
    id: orderId,
    orderId,
    user_id: body.buyer_customer_party?.tax?.company_id ?? "SKU-MW-100",
    status: "CREATED",
    total_amount: 0,
    ubl_xml: ublXml,
    created_at: now,
    updated_at: now,
  };

  await orders.updateOne(
    { orderId },
    {
      $set: orderRecord,
    },
    { upsert: true },
  );

  return NextResponse.json(orderRecord, { status: 201 });
}
