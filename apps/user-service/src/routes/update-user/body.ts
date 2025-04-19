import { z } from "zod";

export const updateUserReqBodySchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().optional(),
  })
  .strict();

export type UpdateUserReqBody = z.infer<typeof updateUserReqBodySchema>;
