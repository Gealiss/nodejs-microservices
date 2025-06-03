import { RequestHandler } from "express";
import { logger } from "@repo/logger";
import { ObjectId } from "@repo/mongodb-client";

import { usersCollection } from "../../db.js";
import { findManyUsersReqQuerySchema } from "./query.js";
import { validateRequestData } from "../../common/validation.utils.js";
import { sendErrorResponse } from "../../common/error.response-body.js";

export const findManyUsersHandler: RequestHandler = async (req, res) => {
  // Validate request data
  const validation = validateRequestData({
    req,
    schemas: {
      query: findManyUsersReqQuerySchema,
    },
  });

  if (validation.error) {
    sendErrorResponse(res, 400, validation.error.message, validation.error.details);
    return;
  }

  const { page, limit } = validation.data.query;
  const skip = (page - 1) * limit;

  try {
    const docs = await usersCollection
      .find({}, { projection: { _id: 1, name: 1, email: 1 } })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const data = docs.map((doc) => ({
      id: (doc._id as ObjectId).toString(),
      name: doc.name,
      email: doc.email,
    }));

    res.json({
      data,
      page,
      limit,
    });
  } catch (error) {
    logger.error(error);
    sendErrorResponse(res, 500, "Internal server error");
    return;
  }
};
