import { RequestHandler } from "express";
import { env } from "../../env.js";

import { mongoClient } from "@repo/mongodb-client";
import { logger } from "@repo/logger";

import { findManyUsersReqQuerySchema } from "./query.js";

export const findManyUsersHandler: RequestHandler = async (req, res) => {
  // Parse and validate request query
  const parseQueryResult = findManyUsersReqQuerySchema.safeParse(req.query);
  if (!parseQueryResult.success) {
    res.status(400).json({ error: parseQueryResult.error });
    return;
  }
  const { page, limit } = parseQueryResult.data;
  const skip = (page - 1) * limit;

  const db = mongoClient.db(env.DB_NAME);
  const usersCollection = db.collection(env.DB_USERS_COLLECTION_NAME);

  try {
    const data = await usersCollection
      .find(
        {},
        {
          projection: { _id: 1, id: 1, name: 1, email: 1, createdAt: 1 },
        }
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({
      data,
      page,
      limit,
    });
  } catch (error) {
    console.error(error);
    logger.error(error);
    res.sendStatus(500);
    return;
  }
};
