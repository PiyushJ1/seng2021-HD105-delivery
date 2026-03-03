import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const despatchAdviceId = searchParams.get("despatchAdviceId");

  // get specific despatch advice doc
  if (despatchAdviceId) {
  }

  // get all despatch advice docs
  return NextResponse.json({ message: "this is the despatch endpoint" });
}

export async function POST(req: NextRequest) {}
