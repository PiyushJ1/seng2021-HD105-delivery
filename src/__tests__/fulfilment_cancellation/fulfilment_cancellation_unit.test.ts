import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

type PostHandler = (req: NextRequest) => Promise<Response>;

const mocks = vi.hoisted(() => {
  const despatchAdvices = {
    findOne: vi.fn(),
  };

  const fulfilmentCancellations = {
    findOne: vi.fn(),
    insertOne: vi.fn(),
  };

  const db = {
    collection: vi.fn((name: string) => {
      if (name === "despatchAdvices") return despatchAdvices;
      if (name === "fulfilmentCancellations") return fulfilmentCancellations;
      throw new Error(`Unexpected collection: ${name}`);
    }),
  };

  const client = {
    db: vi.fn(() => db),
  };

  return {
    despatchAdvices,
    fulfilmentCancellations,
    db,
    client,
  };
});

let POST: PostHandler;
let mockedGetAuth: ReturnType<typeof vi.fn>;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/fulfilment-cancellation", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
