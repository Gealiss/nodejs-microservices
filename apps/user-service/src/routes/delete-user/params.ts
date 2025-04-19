import { z } from "zod";

export const deleteUserReqParamsSchema = z
  .object({
    id: z.string(),
  })
  .strict();

export type DeleteUserReqParams = z.infer<typeof deleteUserReqParamsSchema>;
