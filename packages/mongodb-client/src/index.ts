import { MongoClient } from "mongodb";

const dbUrl = process.env.MONGODB_URL || "mongodb://localhost:27017";

export const mongoClient = new MongoClient(dbUrl, { ignoreUndefined: true });

export * from "mongodb";
