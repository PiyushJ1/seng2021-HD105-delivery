import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";
import { DespatchAdvice } from "@/src/types";
import { requireAuth } from "@/src/lib/auth";

/**
 * @openapi
 * /api/despatch-advice/{despatchAdviceId}:
 *   get:
 *     tags:
 *       - Despatch Advice
 *     summary: Get a despatch advice by ID
 *     parameters:
 *       - in: path
 *         name: despatchAdviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Despatch advice details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DespatchAdvice'
 *       404:
 *         description: Despatch advice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DespatchAdviceByIdNotFoundError'
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ despatchAdviceId: string }> },
) {
  const apiKey =
    req.headers.get("apiKey") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";

  const authResult = await requireAuth(apiKey, {
    roles: ["despatch", "delivery"],
  });
  if (!authResult.ok) return authResult.response;
  const despatchAuth = authResult.auth!;

  // setup db connection
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "development" ? "test" : "production",
  );
  const collection = db.collection("despatch_advice");

  const { despatchAdviceId } = await params;

  const despatchAdvice = (await collection.findOne(
    {
      despatchAdviceId,
    },
    { projection: { _id: 0 } },
  )) as DespatchAdvice | null;

  if (!despatchAdvice) {
    return NextResponse.json(
      {
        error: "No despatch advice was found for the given despatchAdviceId",
      },
      { status: 404 },
    );
  }

	// requesting party can only view the document if they are either the supplier/delivery party
  if (
    despatchAuth.partyId !== despatchAdvice.supplierPartyId &&
    despatchAuth.partyId !== despatchAdvice.deliveryPartyId
  ) {
    return NextResponse.json(
      { error: "You don't have permissions to view this despatch advice doc" },
      { status: 403 },
    );
  }

  return NextResponse.json(despatchAdvice, { status: 200 });
}
