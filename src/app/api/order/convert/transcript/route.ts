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
 * POST /api/order/convert/transcript
 * Convert transcript into order payload
 */
export async function POST(req: NextRequest) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...buildHeaders(req),
    };

    const body = await req.json();

    if (!body?.transcript) {
      return NextResponse.json(
        {
          message: "Request validation failed.",
          errors: [
            {
              path: "transcript",
              message: "Field required",
            },
          ],
        },
        { status: 422 }
      );
    }

    const response = await fetch(
      `${BASE_URL}/v1/orders/convert/transcript`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error("POST transcript convert error:", error.message);

    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: error.message?.includes("Authorization") ? 401 : 500 }
    );
  }
}