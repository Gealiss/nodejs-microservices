import { Router } from "express";

import { createUserHandler } from "./create-user/index.js";
import { deleteUserHandler } from "./delete-user/index.js";
import { updateUserHandler } from "./update-user/index.js";
import { findManyUsersHandler } from "./find-many-users/index.js";

const usersRouter = Router();

usersRouter.get("/", findManyUsersHandler);
usersRouter.post("/", createUserHandler);
usersRouter.put("/:id", updateUserHandler);
usersRouter.delete("/:id", deleteUserHandler);

export { usersRouter };
