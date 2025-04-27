import { Router } from "express";

import { createUserHandler } from "./create-user/index.js";
import { deleteUserHandler } from "./delete-user/index.js";
import { updateUserHandler } from "./update-user/index.js";
import { findManyUsersHandler } from "./find-many-users/index.js";
import { validateAndTransformMiddleware } from "../common/validation.middleware.js";
import { findManyUsersReqQuerySchema } from "./find-many-users/query.js";
import { createUserReqBodySchema } from "./create-user/body.js";
import { updateUserReqParamsSchema } from "./update-user/params.js";
import { updateUserReqBodySchema } from "./update-user/body.js";
import { deleteUserReqParamsSchema } from "./delete-user/params.js";

const usersRouter = Router();

usersRouter.get(
  "/",
  validateAndTransformMiddleware({ query: findManyUsersReqQuerySchema }),
  findManyUsersHandler
);
usersRouter.post(
  "/",
  validateAndTransformMiddleware({ body: createUserReqBodySchema }),
  createUserHandler
);
usersRouter.put(
  "/:id",
  validateAndTransformMiddleware({
    params: updateUserReqParamsSchema,
    body: updateUserReqBodySchema,
  }),
  updateUserHandler
);
usersRouter.delete(
  "/:id",
  validateAndTransformMiddleware({ params: deleteUserReqParamsSchema }),
  deleteUserHandler
);

export { usersRouter };
