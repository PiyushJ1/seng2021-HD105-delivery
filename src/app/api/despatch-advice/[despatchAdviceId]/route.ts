import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";
import { DespatchAdvice } from "@/src/types";

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
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ despatchAdviceId: string }> },
) {
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

  return NextResponse.json(despatchAdvice, { status: 200 });
}
