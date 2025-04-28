import express from "express";
import { env } from "./env.js";

import { logger } from "@repo/logger";
import {
  rmqChannel,
  UserCreatedEventBody,
  UserDeletedEventBody,
  userEvents,
  userEventsExchangeName,
} from "@repo/rmq-client";

import { sendErrorResponse } from "./common/error.response-body.js";

/**
 * RMQ consumer
 */
rmqChannel.consume("notification-service-queue", (msg) => {
  const { exchange, routingKey } = msg.fields;

  if (exchange === userEventsExchangeName) {
    switch (routingKey) {
      case userEvents.userCreated: {
        const { id, name } = JSON.parse(msg.content.toString()) as UserCreatedEventBody;
        logger.info(`Hello, ${name}! (id: ${id})`);
        break;
      }
      case userEvents.userDeleted: {
        const { id } = JSON.parse(msg.content.toString()) as UserDeletedEventBody;
        logger.info(`User '${id}' has been deleted`);
        break;
      }

      default:
        // Other messages
        logger.info(msg);
        break;
    }
  } else {
    // Other messages
    logger.info(msg);
  }

  rmqChannel.ack(msg);
});

const app = express();

/**
 * Health check
 */
app.get("/health", async (req, res) => {
  res.sendStatus(200);
});

/**
 * 404 handler for unmatched routes
 */
app.use((req, res) => {
  sendErrorResponse(res, 404, `Not Found: ${req.originalUrl}`);
});

const server = app.listen(env.PORT, () => {
  logger.info(`Server started on port ${env.PORT}`);
});

process.on("SIGTERM", async () => {
  server.close();
  await rmqChannel.close();
});
