import { DespatchAdviceRequest } from "@/src/types";
import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/src/lib/mongodb";

const client = await clientPromise;
const db = client.db("myFirstDatabase");
const collection = db.collection("despatch_advice");

// mock fetching order for now
async function getOrder(orderId: string) {
  return orderId === "abc123" ? { orderId } : null;
}

export async function POST(req: NextRequest) {
  const body: DespatchAdviceRequest = await req.json();

  // missing/invalid body validation
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

  // validate orderId exists
  if (!getOrder(body.orderId)) {
    return NextResponse.json(
      { error: "the orderId was not found" },
      { status: 404 },
    );
  }

  const existingDoc = await collection.findOne({ orderId: body.orderId });
  if (existingDoc) {
    return NextResponse.json(
      { error: "Despatch advice doc already exists for this order" },
      { status: 409 },
    );
  }
}
