import winston from "winston";

const logLevel = (process.env.LOG_LEVEL as string) || "info";

export const logger = winston.createLogger({
  level: logLevel,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});
