import { RequestHandler } from "express";
import { ObjectId } from "@repo/mongodb-client";
import { logger } from "@repo/logger";

import { usersCollection } from "../../db.js";
import { updateUserReqBodySchema } from "./body.js";
import { updateUserReqParamsSchema } from "./params.js";
import { validateRequestData } from "../../common/validation.utils.js";
import { sendErrorResponse } from "../../common/error.response-body.js";

export const updateUserHandler: RequestHandler = async (req, res) => {
  // Validate request data
  const validation = validateRequestData({
    req,
    schemas: {
      params: updateUserReqParamsSchema,
      body: updateUserReqBodySchema,
    },
  });

  if (validation.error) {
    sendErrorResponse(res, 400, validation.error.message, validation.error.details);
    return;
  }

  const userData = validation.data.body;
  const userId = validation.data.params.id;

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
      sendErrorResponse(res, 400, "User was not found");
      return;
    }
  } catch (error) {
    logger.error(error);
    sendErrorResponse(res, 500, "Internal server error");
    return;
  }

  res.sendStatus(204);
};
