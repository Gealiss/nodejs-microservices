import { RequestHandler } from "express";
import {
  rmqChannel,
  userEvents,
  userEventsExchangeName,
  UserCreatedEventBody,
} from "@repo/rmq-client";
import { logger } from "@repo/logger";

import { CreateUserReqBody } from "./body.js";
import { usersCollection } from "../../db.js";

export const createUserHandler: RequestHandler<unknown, unknown, CreateUserReqBody> = async (
  req,
  res
) => {
  const userData = req.body;

  let createdAt: Date;
  let userId: string;
  try {
    const result = await usersCollection.insertOne({
      name: userData.name,
      email: userData.email,
    });
    userId = result.insertedId.toString();
    createdAt = result.insertedId.getTimestamp();
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
