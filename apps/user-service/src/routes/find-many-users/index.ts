import { RequestHandler } from "express";
import { logger } from "@repo/logger";

import { usersCollection } from "../../db.js";
import { FindManyUsersReqQuery } from "./query.js";

export const findManyUsersHandler: RequestHandler<
  unknown,
  unknown,
  unknown,
  FindManyUsersReqQuery
> = async (req, res) => {
  const { page, limit } = req.query;
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
