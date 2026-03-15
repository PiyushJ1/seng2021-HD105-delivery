import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { GET } from "../../app/api/fulfilment-cancellations/[fulfilmentCancellationId]/route";

const { mockFindOne, mockGetAuth } = vi.hoisted(() => ({
  mockFindOne: vi.fn(),
  mockGetAuth: vi.fn(),
}));

vi.mock("@/src/lib/mongodb", () => ({
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: mockFindOne,
      }),
    }),
  }),
}));

vi.mock("@/src/lib/auth", () => ({
  getAuth: mockGetAuth,
}));

function getRequest(
  fulfilmentCancellationId: string,
  auth = true,
) {
  return new NextRequest(
    `http://localhost/api/fulfilment-cancellations/${encodeURIComponent(fulfilmentCancellationId)}`,
    {
      method: "GET",
      headers: auth ? { Authorization: "Bearer x" } : {},
    },
  );
}
