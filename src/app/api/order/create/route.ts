import clientPromise from "@/src/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "development" ? "test" : "production"
  );
  const users = db.collection("users");

  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const user = await users.findOne({ apiKey });

  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await req.json();

  if (
    body.buyerEmail !== user.email &&
    body.sellerEmail !== user.email
  ) {
    return NextResponse.json(
      { error: "Your email must be buyer or seller" },
      { status: 403 }
    );
  }

  const res = await fetch(
    `${process.env.API_BASE_URL}/v1/order/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.password}`,
        "X-Party-Email": user.email,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}