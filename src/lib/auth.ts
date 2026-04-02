import { NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";

interface AuthResult {
  userId: string;
  role: "delivery" | "despatch";
  partyId: string;
}

export async function getAuth(apiKey: string): Promise<AuthResult | null> {
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

  if (user.role !== "delivery" && user.role !== "despatch") {
    return null;
  }

  return {
    userId: user.email,
    role: user.role,
    partyId: user.partyId,
  };
}

export async function requireAuth(
  apiKey: string,
  options?: { roles?: Array<"delivery" | "despatch"> },
) {
  const auth = await getAuth(apiKey);

  if (!auth) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing or invalid authentication token" },
        { status: 401 },
      ),
    };
  }

  if (options?.roles && !options.roles.includes(auth.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Insufficient permissions for this operation" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, auth };
}
