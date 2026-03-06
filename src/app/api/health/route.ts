import { NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";

export async function GET() {
  try {
    return NextResponse.json(
      {
        status: "ok",
        service: "fulfilment-service",
        version: "1.0.0",
        time: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "degraded",
        service: "fulfilment-service",
        version: "1.0.0",
        time: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Service unavailable",
      },
      { status: 503 },
    );
  }
}
