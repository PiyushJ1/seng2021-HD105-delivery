import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/src/lib/mongodb";
const ALLOWED_STATES = [
  "PLANNED",
  "IN_TRANSIT",
  "RECEIVED",
  "PUTAWAY",
  "CLOSED",
  "CANCELLED",
];

export async function PATCH(req: NextRequest, context: any) {
  try {
    const resolvedParams = await context.params;
    const supplyId = resolvedParams.supplyId;

    const body = await req.json();
    const { newState, expectedVersion, reasonCode, reasonText } = body;
    if (!newState || !ALLOWED_STATES.includes(newState)) {
      return NextResponse.json(
        { error: "Invalid or missing newState" },
        { status: 400 },
      );
    }
    if (typeof expectedVersion !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid expectedVersion" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db(
      process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
        ? "test"
        : "production",
    );
    const suppliesCollection = db.collection("supplies");

    const existingSupply = await suppliesCollection.findOne({ supplyId });

    if (!existingSupply) {
      return NextResponse.json(
        { error: "Supply ID not found" },
        { status: 404 },
      );
    }

    if (existingSupply.version !== expectedVersion) {
      return NextResponse.json(
        { error: "Version mismatch: expectedVersion does not match server" },
        { status: 409 },
      );
    }

    if (newState === "RECEIVED" && !existingSupply.receiptAdviceId) {
      return NextResponse.json(
        { error: "Cannot move to RECEIVED if no receipt advice exists" },
        { status: 422 },
      );
    }

    const stateUpdatedAt = new Date().toISOString();
    const newVersion = existingSupply.version + 1;

    await suppliesCollection.updateOne(
      { supplyId },
      {
        $set: {
          lifecycleState: newState,
          stateUpdatedAt: stateUpdatedAt,
          version: newVersion,
          ...(reasonCode && { reasonCode }),
          ...(reasonText && { reasonText }),
        },
      },
    );

    return NextResponse.json(
      {
        supplyId: existingSupply.supplyId,
        orderId: existingSupply.orderId,
        receiptAdviceId: existingSupply.receiptAdviceId,
        warehouseId: existingSupply.warehouseId,
        lifecycleState: newState,
        stateUpdatedAt: stateUpdatedAt,
        version: newVersion,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Lifecycle PATCH Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
