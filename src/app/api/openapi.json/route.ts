import { NextResponse } from "next/server";
import { getOpenAPISpec } from "@/src/lib/swagger";

export async function GET() {
  return NextResponse.json(getOpenAPISpec(), { status: 200 });
}
