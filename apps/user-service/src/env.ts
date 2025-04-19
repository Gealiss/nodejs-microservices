import { z } from "zod";

// Define schema for environment variables
const envSchema = z.object({
  PORT: z.coerce.number().int(),
  NODE_ENV: z.enum(["development", "production"]),
  LOG_LEVEL: z.string().default("info"),

  RMQ_URL: z.string().url(),

  MONGODB_URL: z.string().url(),
  DB_NAME: z.string().min(1),
  DB_USERS_COLLECTION_NAME: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
