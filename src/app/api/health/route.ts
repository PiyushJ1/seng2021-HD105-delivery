import { NextResponse } from "next/server";

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check service health
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: ok
 *               service: fulfilment-service
 *               version: 1.0.0
 *               time: "2026-03-16T10:30:00.000Z"
 *       503:
 *         description: Service is degraded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthDegradedErrorResponse'
 *             example:
 *               status: degraded
 *               service: fulfilment-service
 *               version: 1.0.0
 *               time: "2026-03-16T10:45:00.000Z"
 *               error: Service unavailable
 */

export async function GET() {
  try {
    return NextResponse.json(
      {
        status: "ok",
        service: "fulfilment-service",
        version: "1.0.0",
        time: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "degraded",
        service: "fulfilment-service",
        version: "1.0.0",
        time: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Service unavailable",
      },
      { status: 503 },
    );
  }
}
