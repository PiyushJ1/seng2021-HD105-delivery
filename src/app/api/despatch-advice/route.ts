import { NextResponse, NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { DespatchAdviceRequest } from "@/src/types";
import clientPromise from "@/src/lib/mongodb";

// mock fetching order for now
// TODO: fetch the actual order
async function getOrder(orderId: string) {
  return orderId === "abc123" ? { orderId } : null;
}

// mock getting the inventory for a product given its ID
// TODO: fetch the actual inventory for a product
async function getInventory(productId: string) {
  return { productId, remainingQuantity: 100 };
}

/**
 * @openapi
 * /api/despatch-advice:
 *   post:
 *     tags:
 *       - Despatch Advice
 *     summary: Create a despatch advice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DespatchAdviceRequest'
 *     responses:
 *       200:
 *         description: Despatch advice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DespatchAdviceCreateResponse'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DespatchAdviceCreateBadRequestError'
 *       404:
 *         description: orderId was not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DespatchAdviceCreateNotFoundError'
 *       409:
 *         description: Despatch advice already exists for order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DespatchAdviceCreateConflictError'
 *       422:
 *         description: Item quantity exceeds inventory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DespatchAdviceCreateUnprocessableError'
 *   get:
 *     tags:
 *       - Despatch Advice
 *     summary: Get all despatch advices
 *     responses:
 *       200:
 *         description: List of despatch advices
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DespatchAdviceListResponse'
 */

export async function POST(req: NextRequest) {
  // setup db connection
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "development" ? "test" : "production",
  );
  const collection = db.collection("despatch_advice");

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
  const order = await getOrder(body.orderId);
  if (!order) {
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

  // validate that item quantities requested have available stock
  for (const item of body.items) {
    const inventory = await getInventory(item.productId);
    if (inventory.remainingQuantity < item.quantity) {
      return NextResponse.json(
        { error: "item quantity exceeds the quantity available" },
        { status: 422 },
      );
    }
  }

  const despatchAdviceId = randomUUID();

  // create and insert despatch advice "doc" into db
  await collection.insertOne({
    despatchAdviceId,
    orderId: body.orderId,
    supplierPartyId: body.supplierPartyId,
    deliveryPartyId: body.deliveryPartyId,
    despatchDate: body.despatchDate,
    items: body.items,
    status: "Complete",
  });

  return NextResponse.json({
    despatchAdviceId,
    status: "Complete",
  });
}

export async function GET() {
  // setup db connection
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "development" ? "test" : "production",
  );
  const collection = db.collection("despatch_advice");

  const despatchAdvices = await collection
    .find({}, { projection: { _id: 0 } })
    .toArray();

  return NextResponse.json({ despatchAdvices }, { status: 200 });
}
