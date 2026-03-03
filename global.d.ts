import { MongoClient } from "mongodb";

declare global {
  // Use var for global augmentation
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export {};
