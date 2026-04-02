import clientPromise from "@/src/lib/mongodb";
import { NextResponse, NextRequest } from "next/server";
import validator from "validator";

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "development" ? "test" : "production",
  );
  const collection = db.collection("users");

  const { email, password, role } = await req.json();

	// check if email format is valid
  if (!validator.isEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 },
    );
  }

	
}
