import { RequestHandler } from "express";
import { env } from "../../env.js";

import { mongoClient } from "@repo/mongodb-client";
import {
  rmqChannel,
  userEvents,
  userEventsExchangeName,
  UserCreatedEventBody,
} from "@repo/rmq-client";

import { createUserReqBodySchema } from "./body.js";
import { logger } from "@repo/logger";

export const createUserHandler: RequestHandler = async (req, res) => {
  // Parse and validate request body
  const parseResult = createUserReqBodySchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error });
    return;
  }

  const userData = parseResult.data;
  const createdAt = new Date();
  let userId: string;

  const db = mongoClient.db(env.DB_NAME);
  const usersCollection = db.collection(env.DB_USERS_COLLECTION_NAME);

  try {
    const result = await usersCollection.insertOne({
      name: userData.name,
      email: userData.email,
      createdAt,
    });
    userId = result.insertedId.toString();
  } catch (error) {
    logger.error(error);
    res.sendStatus(500);
    return;
  }

  const messageBody: UserCreatedEventBody = {
    id: userId,
    name: userData.name,
  };

  try {
    await rmqChannel.publish(userEventsExchangeName, userEvents.userCreated, messageBody);
  } catch (error) {
    // Not so critical
    logger.error(error);
  }

  res.status(201).json({ ...userData, id: userId, createdAt });
};
