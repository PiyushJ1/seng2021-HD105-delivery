import { NextResponse } from "next/server";
import { getOpenAPISpec } from "@/src/lib/swagger";

/**
 * @openapi
 * /api/openapi.json:
 *   get:
 *     tags:
 *       - Health
 *     summary: Get generated OpenAPI specification
 *     responses:
 *       200:
 *         description: OpenAPI JSON document
 */

export async function GET() {
  return NextResponse.json(getOpenAPISpec(), { status: 200 });
}
