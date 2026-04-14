import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.API_BASE_URL!;

export async function PUT(
  req: NextRequest,
  { params }: { params: { order_id: string } }
) {
  try {
    const { order_id } = params;

    const authHeader = req.headers.get("authorization");
    const partyEmail = req.headers.get("x-party-email");

    if (!authHeader) {
      return NextResponse.json({ detail: "Missing Authorization header" }, { status: 401 });
    }

    const body = await req.json();

    const response = await fetch(`${BASE_URL}/v1/order/${order_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        ...(partyEmail && { "X-Party-Email": partyEmail }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error("PUT /order error:", error);

    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}