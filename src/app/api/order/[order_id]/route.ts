import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.API_BASE_URL!;

function buildHeaders(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const email = req.headers.get("x-party-email");

  if (!auth) {
    throw new Error("Missing Authorization header");
  }

  return {
    Authorization: auth,
    ...(email && { "X-Party-Email": email }),
  };
}

type Params = Promise<{ order_id: string }>;

/**
 * GET /api/order/:order_id
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { order_id } = await params;

    const headers = buildHeaders(req);

    const response = await fetch(`${BASE_URL}/v1/order/${order_id}`, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("GET order error:", error.message);

    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: error.message?.includes("Authorization") ? 401 : 500 },
    );
  }
}

/**
 * PUT /api/order/:order_id
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { order_id } = await params;

    const headers = {
      "Content-Type": "application/json",
      ...buildHeaders(req),
    };

    const body = await req.json();

    const response = await fetch(`${BASE_URL}/v1/order/${order_id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("PUT order error:", error.message);

    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: error.message?.includes("Authorization") ? 401 : 500 },
    );
  }
}

/**
 * DELETE /api/order/:order_id
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { order_id } = await params;

    const headers = buildHeaders(req);

    const response = await fetch(`${BASE_URL}/v1/order/${order_id}`, {
      method: "DELETE",
      headers,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("DELETE order error:", error.message);

    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: error.message?.includes("Authorization") ? 401 : 500 },
    );
  }
}