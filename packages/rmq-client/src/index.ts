import {
  connect,
  ChannelWrapper,
  ConnectionUrl,
  AmqpConnectionManager,
} from "amqp-connection-manager";
import { Channel, Options } from "amqplib";
import { logger } from "@repo/logger";

export interface ExchangeConfig {
  exchange: string;
  type: string;
  options?: Options.AssertExchange;
}
export interface QueueConfig {
  queue: string;
  options?: Options.AssertQueue;
}
export interface BindingConfig {
  queue: string;
  source: string;
  pattern: string;
  args?: any;
}

export type Topology = Partial<{
  exchanges: ExchangeConfig[];
  queues: QueueConfig[];
  bindings: BindingConfig[];
}>;

export const notificationServiceQueueName = "notification-service-queue";

export const userEventsExchangeName = "user.events";

export const userEvents = {
  userCreated: "user.created",
  userDeleted: "user.deleted",
} as const;

export interface UserCreatedEventBody {
  id: string;
  name: string;
}

export interface UserDeletedEventBody {
  id: string;
}

const topology: Topology = {
  exchanges: [{ exchange: userEventsExchangeName, type: "topic", options: { durable: true } }],
  queues: [{ queue: notificationServiceQueueName, options: { durable: true } }],
  bindings: [
    // Example: some other "audit service" wants all user events
    // { queue: "audit-service-queue", source: "user.events", pattern: "user.*" },

    // notification service needs only user.created and user.deleted events
    {
      queue: notificationServiceQueueName,
      source: userEventsExchangeName,
      pattern: userEvents.userCreated,
    },
    {
      queue: notificationServiceQueueName,
      source: userEventsExchangeName,
      pattern: userEvents.userDeleted,
    },
  ],
};

const rmqUrl = process.env.RMQ_URL;

const connectionManager = connect(rmqUrl);

connectionManager.on("connect", () => {
  logger.info("RabbitMQ connection has been established");
});
connectionManager.on("connectFailed", (arg) => {
  logger.error(arg.err);
});
connectionManager.on("disconnect", (arg) => {
  logger.error(arg.err);
});

export const rmqChannel: ChannelWrapper = connectionManager.createChannel({
  json: true,
  setup: async (ch: Channel) => {
    // assert exchanges
    if (topology.exchanges) {
      for (const ex of topology.exchanges) {
        await ch.assertExchange(ex.exchange, ex.type, ex.options);
      }
    }
    // assert queues
    if (topology.queues) {
      for (const q of topology.queues) {
        await ch.assertQueue(q.queue, q.options);
      }
    }
    // bind queues
    if (topology.bindings) {
      for (const b of topology.bindings) {
        await ch.bindQueue(b.queue, b.source, b.pattern, b.args);
      }
    }
  },
});

rmqChannel.on("error", (err) => {
  logger.error(err);
});
rmqChannel.on("connect", () => {
  logger.info("RabbitMQ channel has been connected");
});
rmqChannel.on("close", () => {
  logger.info("RabbitMQ channel has been closed");
});
