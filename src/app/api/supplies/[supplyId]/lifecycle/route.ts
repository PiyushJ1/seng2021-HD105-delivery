import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// The exact allowed states from your API documentation
const ALLOWED_STATES = [
  "PLANNED", "IN_TRANSIT", "RECEIVED", "PUTAWAY", "CLOSED", "CANCELLED"
];

export async function PATCH(
  request: Request,
  { params }: { params: { supplyId: string } }
) {
  let client;

  try {
    // 1. Extract path parameter and request body
    const { supplyId } = params;
    const body = await request.json();
    const { newState, expectedVersion, reasonCode, reasonText } = body;

    // 2. Initial Validation (400 Bad Request)
    if (!newState || !ALLOWED_STATES.includes(newState)) {
      return NextResponse.json(
        { error: "Invalid or missing newState" }, 
        { status: 400 }
      );
    }
    if (typeof expectedVersion !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid expectedVersion" }, 
        { status: 400 }
      );
    }

    // 3. Connect to the Database
    // Note: We use the raw MongoClient to perfectly match your team's test setup
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("test"); 
    const suppliesCollection = db.collection("supplies");

    // 4. Fetch the existing supply item (404 Not Found)
    const existingSupply = await suppliesCollection.findOne({ supplyId });
    if (!existingSupply) {
      await client.close();
      return NextResponse.json(
        { error: "Supply ID not found" }, 
        { status: 404 }
      );
    }

    // 5. Concurrency Check (409 Conflict)
    if (existingSupply.version !== expectedVersion) {
      await client.close();
      return NextResponse.json(
        { error: "Version mismatch: expectedVersion does not match server" }, 
        { status: 409 }
      );
    }

    // 6. Business Rule: Cannot receive without a receipt advice (422 Violation)
    if (newState === "RECEIVED" && !existingSupply.receiptAdviceId) {
      await client.close();
      return NextResponse.json(
        { error: "Cannot move to RECEIVED if no receipt advice exists" }, 
        { status: 422 }
      );
    }

    // 7. Perform the Update
    const stateUpdatedAt = new Date().toISOString();
    const newVersion = existingSupply.version + 1;

    await suppliesCollection.updateOne(
      { supplyId },
      {
        $set: { 
          lifecycleState: newState, 
          stateUpdatedAt: stateUpdatedAt,
          version: newVersion,
          // Only add reason fields to the database if the user actually sent them
          ...(reasonCode && { reasonCode }),
          ...(reasonText && { reasonText })
        }
      }
    );

    await client.close();

    // 8. Return the Success Payload (200 OK)
    return NextResponse.json({
      supplyId: existingSupply.supplyId,
      orderId: existingSupply.orderId,
      receiptAdviceId: existingSupply.receiptAdviceId,
      warehouseId: existingSupply.warehouseId,
      lifecycleState: newState,
      stateUpdatedAt: stateUpdatedAt,
      version: newVersion
    }, { status: 200 });

  } catch (error) {
    // Safety net: ensure the DB connection closes even if the code crashes
    if (client) await client.close();
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}