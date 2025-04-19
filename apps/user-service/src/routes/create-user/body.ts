import { z } from "zod";

export const createUserReqBodySchema = z
  .object({
    name: z.string().min(1).max(200),
    email: z.string().email(),
  })
  .strict();

export type CreateUserReqBody = z.infer<typeof createUserReqBodySchema>;
