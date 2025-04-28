import { RequestHandler } from "express";
import { ObjectId } from "@repo/mongodb-client";
import { logger } from "@repo/logger";

import { usersCollection } from "../../db.js";
import { updateUserReqBodySchema } from "./body.js";
import { updateUserReqParamsSchema } from "./params.js";
import { validateRequestData } from "../../common/validation.utils.js";

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
    res.status(400).json(validation.error);
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
      res.status(400).json({ error: "User was not found" });
      return;
    }
  } catch (error) {
    logger.error(error);
    res.sendStatus(500);
    return;
  }

  res.sendStatus(204);
};
