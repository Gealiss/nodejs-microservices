import { RequestHandler } from "express";
import { ObjectId } from "@repo/mongodb-client";
import {
  rmqChannel,
  userEvents,
  userEventsExchangeName,
  UserDeletedEventBody,
} from "@repo/rmq-client";
import { logger } from "@repo/logger";

import { usersCollection } from "../../db.js";
import { validateRequestData } from "../../common/validation.utils.js";
import { deleteUserReqParamsSchema } from "./params.js";

export const deleteUserHandler: RequestHandler = async (req, res) => {
  // Validate request data
  const validation = validateRequestData({
    req,
    schemas: {
      params: deleteUserReqParamsSchema,
    },
  });

  if (validation.error) {
    res.status(400).json(validation.error);
    return;
  }

  const userId = validation.data.params.id;

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
