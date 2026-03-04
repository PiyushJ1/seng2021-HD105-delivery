import { NextResponse } from "next/server";
import clientPromise from "@/src/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Ping the database to verify the connection is alive
    await db.command({ ping: 1 });

    // Create a "test" collection and insert a sample document
    const collection = db.collection("test");
    const doc = {
      message: "Hello from MongoDB!",
      createdAt: new Date(),
    };
    const result = await collection.insertOne(doc);

    // Read it back to confirm
    const inserted = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json({
      status: "success",
      message: "Connected to MongoDB and inserted a test document!",
      database: db.databaseName,
      insertedDocument: inserted,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to MongoDB",
      },
      { status: 500 },
    );
  }
}
