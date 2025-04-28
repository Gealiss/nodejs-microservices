import express from "express";
import { env } from "./env.js";

import { rmqChannel } from "@repo/rmq-client";
import { logger } from "@repo/logger";
import { mongoClient } from "@repo/mongodb-client";

import { usersRouter } from "./routes/users.router.js";

const app = express();

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check
 */
app.get("/health", async (req, res) => {
  res.sendStatus(200);
});

/**
 * Users operations
 */
app.use("/users", usersRouter);

/**
 * 404 handler for unmatched routes
 */
app.use((req, res) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

const server = app.listen(env.PORT, () => {
  logger.info(`Server started on port ${env.PORT}`);
});

process.on("SIGTERM", async () => {
  server.close();
  await rmqChannel.close();
  await mongoClient.close();
});
