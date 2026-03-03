import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      message: "Service is healthy",
    },
    { status: 200 },
  );
}
