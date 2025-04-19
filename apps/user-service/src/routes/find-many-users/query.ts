import { z } from "zod";

export const findManyUsersReqQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const n = parseInt(val ?? "1", 10);
      return Number.isNaN(n) || n < 1 ? 1 : n;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const n = parseInt(val ?? "10", 10);
      return Number.isNaN(n) || n < 1 ? 10 : n;
    }),
});

export type FindManyUsersReqQuery = z.infer<typeof findManyUsersReqQuerySchema>;
