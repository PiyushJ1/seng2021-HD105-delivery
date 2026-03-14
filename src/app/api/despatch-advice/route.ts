import { DespatchAdviceRequest } from "@/src/types";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body: DespatchAdviceRequest = await req.json();

  if (
    typeof body.orderId !== "string" ||
    typeof body.supplierPartyId !== "string" ||
    typeof body.deliveryPartyId !== "string" ||
    typeof body.despatchDate !== "string" ||
    !Array.isArray(body.items) ||
    body.items.length === 0
  ) {
    return NextResponse.json(
      {
        error: "Missing or invalid fields in the request body",
      },
      { status: 400 },
    );
  }
}
