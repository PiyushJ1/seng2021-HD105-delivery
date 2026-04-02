import { NextRequest } from "next/server";
import clientPromise from "@/src/lib/mongodb";

interface AuthResult {
  userId: string;
  role: "delivery_party" | "despatch_party";
  partyId: string;
}

export async function getAuth(req: NextRequest): Promise<AuthResult | null> {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return null;

  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "development" ? "test" : "production",
  );
  const users = db.collection("users");

  const user = await users.findOne({ apiKey });
  if (!user) {
    return null;
  }

  return {
    userId: user.userId ?? user.email,
    role: user.role,
    partyId: user.partyId,
  };
}
