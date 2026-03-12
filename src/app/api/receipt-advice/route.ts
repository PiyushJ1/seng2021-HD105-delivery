import { randomUUID } from "crypto";

type Item = {
  productId: string;
  quantityReceived: number;
};

const processedReceipts = new Set<string>();

export async function POST(req: Request) {
  const body = await req.json();

  // validate required fields
  if (
    !body.despatchId ||
    !body.deliveryPartyId ||
    !body.receivedDate ||
    !body.items
  ) {
    return Response.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // fake despatch validation
  if (body.despatchId === "INVALID") {
    return Response.json(
      { error: "Despatch not found" },
      { status: 404 }
    );
  }

  if (processedReceipts.has(body.despatchId)) {
    return Response.json(
      { error: "Duplicate receipt advice" },
      { status: 409 }
    );
  }

  const totalItemsReceived = body.items.reduce(
    (sum: number, item: Item) => sum + item.quantityReceived,
    0
  );

  const response = {
    receiptAdviceId: randomUUID(),
    status: "RECEIVED",
    totalItemsReceived
  };

  processedReceipts.add(body.despatchId);

  return Response.json(response, { status: 200 });
}