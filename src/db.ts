// src/db.ts
import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  const uri =
    process.env.MONGO_URI ??
    "mongodb://admin:admin123@localhost:27017/mi_base?authSource=admin";
  client = new MongoClient(uri);
  await client.connect();
  db = client.db("mi_base");
  console.log("✅ Connected to MongoDB:", db.databaseName);
  return db;
}

export function getDb(): Db {
  if (!db)
    throw new Error("database not connected. call connectToDatabase first.");
  return db;
}
