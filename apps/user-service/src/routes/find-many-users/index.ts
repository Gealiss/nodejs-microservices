import { RequestHandler } from "express";
import { logger } from "@repo/logger";

import { usersCollection } from "../../db.js";
import { findManyUsersReqQuerySchema } from "./query.js";
import { validateRequestData } from "../../common/validation.utils.js";

export const findManyUsersHandler: RequestHandler = async (req, res) => {
  // Validate request data
  const validation = validateRequestData({
    req,
    schemas: {
      query: findManyUsersReqQuerySchema,
    },
  });

  if (validation.error) {
    res.status(400).json(validation.error);
    return;
  }

  const { page, limit } = validation.data.query;
  const skip = (page - 1) * limit;

  try {
    const data = await usersCollection
      .find(
        {},
        {
          projection: { _id: 1, id: 1, name: 1, email: 1, createdAt: 1 },
        }
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({
      data,
      page,
      limit,
    });
  } catch (error) {
    logger.error(error);
    res.sendStatus(500);
    return;
  }
};
