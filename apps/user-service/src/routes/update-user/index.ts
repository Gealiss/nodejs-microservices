import { RequestHandler } from "express";

import { ObjectId } from "@repo/mongodb-client";
import { logger } from "@repo/logger";

import { usersCollection } from "../../db.js";
import { UpdateUserReqBody } from "./body.js";
import { UpdateUserReqParams } from "./params.js";
import { ErrorResponseBody } from "../../common/error.response-body.js";

export const updateUserHandler: RequestHandler<
  UpdateUserReqParams,
  unknown,
  UpdateUserReqBody
> = async (req, res) => {
  const userData = req.body;
  const userId = req.params.id;

  try {
    const result = await usersCollection.updateOne(
      {
        _id: new ObjectId(userId),
      },
      {
        $set: {
          name: userData.name,
          email: userData.email,
        },
      },
      { upsert: false }
    );

    if (result.matchedCount === 0) {
      const responseBody: ErrorResponseBody = { error: "User was not found" };
      res.status(400).json(responseBody);
      return;
    }
  } catch (error) {
    logger.error(error);
    res.sendStatus(500);
    return;
  }

  res.sendStatus(204);
};
