import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";
import { getAuth } from "@/src/lib/auth";

type CancelledItem = {
  productId: string;
  quantityCancelled: number;
  reasonCode?: string;
};

type DespatchAdviceItem = {
  productId: string;
  quantityDespatched?: number;
  quantity?: number;
};

type DespatchAdviceDocument = {
  despatchAdviceId: string;
  items: DespatchAdviceItem[];
};

type FulfilmentCancellationDocument = {
  fulfilmentCancellationId: string;
  status: "Created";
  despatchAdviceId: string;
  cancellationDate: string;
  cancelledItems: CancelledItem[];
  reason?: string;
};

function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function generateFulfilmentCancellationId(): string {
  return `FC${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

function getDespatchedQuantity(item: DespatchAdviceItem): number {
  if (typeof item.quantityDespatched === "number") {
    return item.quantityDespatched;
  }

  if (typeof item.quantity === "number") {
    return item.quantity;
  }

  return 0;
}
