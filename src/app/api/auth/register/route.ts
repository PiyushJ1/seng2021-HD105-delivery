import clientPromise from "@/src/lib/mongodb";
import { NextResponse, NextRequest } from "next/server";
import validator from "validator";
import { randomUUID } from "crypto";

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

  // missing/invalid body validation
  if (typeof password !== "string" || typeof role !== "string") {
    return NextResponse.json(
      { error: "Password or role format is invalid" },
      { status: 400 },
    );
  }

  // ensure role is only either delivery or despatch
  if (role !== "delivery" && role !== "despatch") {
    return NextResponse.json(
      {
        error: "role can only be either 'delivery' or 'despatch'",
      },
      { status: 400 },
    );
  }

  // check if the user already exists
  const existingUser = await collection.findOne({ email: email });
  if (existingUser) {
    return NextResponse.json(
      { error: "A user is already registered with this email" },
      { status: 404 },
    );
  }

  // register new user (save to db)
  await collection.insertOne({
    email,
    password,
    role,
  });

  return NextResponse.json({ message: "success!" });
}
