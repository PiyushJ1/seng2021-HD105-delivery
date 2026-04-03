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

  // find the user associated with the api key
  const user = await users.findOne({ apiKey });
  if (!user) {
    return null;
  }

  if (user.role !== "delivery" && user.role !== "despatch") {
    return null;
  }

  // return auth details containing userId, role, and partyId
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
        { error: "Missing/invalid authentication token" },
        { status: 401 },
      ),
    };
  }

  // if the options.roles array exists and does not include the
  // required role for the operation, forbid access
  if (options?.roles && !options.roles.includes(auth.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Accessing this endpoint is unauthorised" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, auth };
}
