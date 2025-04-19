import { RequestHandler } from "express";
import { env } from "../../env.js";

import { mongoClient, ObjectId } from "@repo/mongodb-client";
import {
  rmqChannel,
  userEvents,
  userEventsExchangeName,
  UserDeletedEventBody,
} from "@repo/rmq-client";
import { logger } from "@repo/logger";

import { deleteUserReqParamsSchema } from "./params.js";

export const deleteUserHandler: RequestHandler = async (req, res) => {
  // Parse and validate request params
  const parseParamsResult = deleteUserReqParamsSchema.safeParse(req.params);
  if (!parseParamsResult.success) {
    res.status(400).json({ error: parseParamsResult.error });
    return;
  }
  const userId = parseParamsResult.data.id;

  const db = mongoClient.db(env.DB_NAME);
  const usersCollection = db.collection(env.DB_USERS_COLLECTION_NAME);

  try {
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    if (result.deletedCount !== 1) {
      res.status(400).json({ error: "User was not deleted" });
      return;
    }
  } catch (error) {
    logger.error(error);
    res.sendStatus(500);
    return;
  }

  const messageBody: UserDeletedEventBody = { id: userId };

  try {
    await rmqChannel.publish(userEventsExchangeName, userEvents.userDeleted, messageBody);
  } catch (error) {
    // Not so critical
    logger.error(error);
  }

  res.sendStatus(204);
};
