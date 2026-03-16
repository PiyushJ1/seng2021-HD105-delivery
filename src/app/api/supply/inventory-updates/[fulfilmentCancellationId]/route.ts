import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/src/lib/mongodb";

export async function PUT(
  req: NextRequest,
  { params }: { params: { fulfilmentCancellationId: string } }
) {
  const { fulfilmentCancellationId } = params;
  const client = await clientPromise;
  const db = client.db(process.env.NODE_ENV === "development" ? "test" : "production");
  
  const body = await req.json();
  const { warehouseId, binId, inventoryAdjustmentLines } = body;

  if (!warehouseId || !binId || !Array.isArray(inventoryAdjustmentLines)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const session = client.startSession();
  try {
    let responseData: any = null;

    await session.withTransaction(async () => {
      const cancellationColl = db.collection("fulfilment_cancellations");
      const inventoryColl = db.collection("inventory_positions");

      const cancellation = await cancellationColl.findOne({ fulfilmentCancellationId });
      if (!cancellation) throw { status: 404, message: "Cancellation ID not found" };

      if (cancellation.applied) throw { status: 409, message: "Cancellation already applied" };

      const positionsUpdated = [];
      const appliedAt = new Date().toISOString();

      for (const line of inventoryAdjustmentLines) {
        if (line.quantity < 0) throw { status: 400, message: "Negative quantity not allowed" };

        const cancellationItem = cancellation.items?.find((i: any) => i.sku === line.sku);
        if (!cancellationItem) throw { status: 422, message: `SKU ${line.sku} not in cancellation` };
        if (line.quantity > cancellationItem.quantity) throw { status: 422, message: "Quantity exceeds cancellable amount" };


        const result = await inventoryColl.findOneAndUpdate(
          { warehouseId, binId, sku: line.sku, uom: line.uom },
          { 
            $inc: { onHand: line.quantity, available: line.quantity },
            $set: { updatedAt: appliedAt }
          },
          { returnDocument: "after", session }
        );

        if (!result) throw { status: 404, message: `Inventory position for ${line.sku} not found` };
        

        const { _id, ...cleanRecord } = result;
        positionsUpdated.push(cleanRecord);
      }


      await cancellationColl.updateOne(
        { fulfilmentCancellationId },
        { $set: { applied: true, appliedAt } },
        { session }
      );

      responseData = {
        fulfilmentCancellationId,
        applied: true,
        appliedAt,
        positionsUpdated
      };
    });

    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: error.status || 500 }
    );
  } finally {
    await session.endSession();
  }
}