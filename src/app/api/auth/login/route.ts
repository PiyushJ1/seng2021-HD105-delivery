import clientPromise from "@/src/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db(
    process.env.NODE_ENV === "development" ? "test" : "production",
  );
  const collection = db.collection("users");

  const { email, password } = await req.json();

  // check if email format is valid
  if (!validator.isEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 },
    );
  }

  // missing/invalid body validation
  if (typeof password !== "string") {
    return NextResponse.json(
      { error: "Password must be a string" },
      { status: 400 },
    );
  }

  const user = await collection.findOne({ email: email });
  const tempApiKey = randomUUID();

  if (user?.password === password) {
    await collection.updateOne(
      { email: email },
      { $set: { apiKey: tempApiKey } }, // set a new field containing the api key
    );

    return NextResponse.json({
      message: "Logged in successfully!",
      apiKey: tempApiKey,
    });
  }

  return NextResponse.json(
    { message: "Failed to log in. Try again." },
    { status: 401 },
  );
}
