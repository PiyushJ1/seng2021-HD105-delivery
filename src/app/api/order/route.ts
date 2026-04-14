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
 * GET /api/order
 * List orders with pagination
 */
export async function GET(req: NextRequest) {
  try {
    const headers = buildHeaders(req);

    // Get query params
    const { searchParams } = new URL(req.url);

    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";

    const response = await fetch(
      `${BASE_URL}/v1/orders?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers,
      },
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("GET orders error:", error.message);

    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: error.message?.includes("Authorization") ? 401 : 500 },
    );
  }
}
