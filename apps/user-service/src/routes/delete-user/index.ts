import { RequestHandler } from "express";
import { ObjectId } from "@repo/mongodb-client";
import {
  rmqChannel,
  userEvents,
  userEventsExchangeName,
  UserDeletedEventBody,
} from "@repo/rmq-client";
import { logger } from "@repo/logger";

import { DeleteUserReqParams } from "./params.js";
import { ErrorResponseBody } from "../../common/error.response-body.js";
import { usersCollection } from "../../db.js";

export const deleteUserHandler: RequestHandler<DeleteUserReqParams> = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    if (result.deletedCount !== 1) {
      const responseBody: ErrorResponseBody = { error: "User was not deleted" };
      res.status(400).json(responseBody);
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
