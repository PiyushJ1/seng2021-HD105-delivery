import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.API_BASE_URL!;

/**
 * Helper to build auth headers
 */
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

/**
 * GET /api/order/:order_id/ubl
 * Fetch order UBL XML
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { order_id: string } },
) {
  try {
    const { order_id } = params;

    const headers = buildHeaders(req);

    const response = await fetch(`${BASE_URL}/v1/order/${order_id}/ubl`, {
      method: "GET",
      headers,
    });

    const xml = await response.text();

    return new NextResponse(xml, {
      status: response.status,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error: any) {
    console.error("GET order UBL error:", error.message);

    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: error.message?.includes("Authorization") ? 401 : 500 },
    );
  }
}
