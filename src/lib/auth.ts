import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface AuthResult {
  userId: string;
  role: "delivery_party" | "despatch_party";
  orgId?: string; // delivery party ID
}

export async function getAuth(req: NextRequest): Promise<AuthResult | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null; 
    return {
      userId: payload.sub,
      role: payload.role as "delivery_party" | "despatch_party",
      orgId: payload.orgId as string | undefined,
    };
  } catch {
    return null;
  }
}

/** Usage:
 * 
 * Check if user is authorised:
   if (!auth) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
   }

  If role is despatch, return all receipts:
  if (auth.role === "despatch_party") {
    return NextResponse.json(receipt);  // see all
  }

 * 
 */