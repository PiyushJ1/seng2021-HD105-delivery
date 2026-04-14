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
 * GET /api/order/analytics
 * Fetch order analytics
 */
export async function GET(req: NextRequest) {
  try {
    const headers = buildHeaders(req);

    const { searchParams } = new URL(req.url);

    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    if (!fromDate || !toDate) {
      return NextResponse.json(
        {
          message: "Request validation failed.",
          errors: [
            !fromDate && {
              source: "query",
              path: "fromDate",
              message: "Field required",
            },
            !toDate && {
              source: "query",
              path: "toDate",
              message: "Field required",
            },
          ].filter(Boolean),
        },
        { status: 422 }
      );
    }

    const response = await fetch(
      `${BASE_URL}/v1/analytics/orders?fromDate=${encodeURIComponent(
        fromDate
      )}&toDate=${encodeURIComponent(toDate)}`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error("GET analytics error:", error.message);

    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: error.message?.includes("Authorization") ? 401 : 500 }
    );
  }
}