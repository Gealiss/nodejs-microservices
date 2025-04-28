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
import { sendErrorResponse } from "../../common/error.response-body.js";

export const deleteUserHandler: RequestHandler = async (req, res) => {
  // Validate request data
  const validation = validateRequestData({
    req,
    schemas: {
      params: deleteUserReqParamsSchema,
    },
  });

  if (validation.error) {
    sendErrorResponse(res, 400, validation.error.message, validation.error.details);
    return;
  }

  const userId = validation.data.params.id;

  try {
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    if (result.deletedCount !== 1) {
      sendErrorResponse(res, 400, "User was not deleted");
      return;
    }
  } catch (error) {
    logger.error(error);
    sendErrorResponse(res, 500, "Internal server error");
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
