import { z } from "zod";

export const updateUserReqParamsSchema = z
  .object({
    id: z.string(),
  })
  .strict();

export type UpdateUserReqParams = z.infer<typeof updateUserReqParamsSchema>;
