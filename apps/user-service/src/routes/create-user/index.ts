import { RequestHandler } from "express";
import {
  rmqChannel,
  userEvents,
  userEventsExchangeName,
  UserCreatedEventBody,
} from "@repo/rmq-client";
import { logger } from "@repo/logger";

import { usersCollection } from "../../db.js";
import { validateRequestData } from "../../common/validation.utils.js";
import { createUserReqBodySchema } from "./body.js";
import { sendErrorResponse } from "../../common/error.response-body.js";

export const createUserHandler: RequestHandler = async (req, res) => {
  // Validate request data
  const validation = validateRequestData({
    req,
    schemas: {
      body: createUserReqBodySchema,
    },
  });

  if (validation.error) {
    sendErrorResponse(res, 400, validation.error.message, validation.error.details);
    return;
  }

  const userData = validation.data.body;

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
    sendErrorResponse(res, 500, "Internal server error");
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
