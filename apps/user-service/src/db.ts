import { mongoClient } from "@repo/mongodb-client";

import { env } from "./env.js";

export const db = mongoClient.db(env.DB_NAME);

// Collections
export const usersCollection = db.collection(env.DB_USERS_COLLECTION_NAME);
