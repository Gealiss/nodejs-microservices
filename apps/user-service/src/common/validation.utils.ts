import { z } from "zod";
import { Request } from "express";

type ValidationResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: {
        message: string;
        details: z.ZodIssue[];
      };
    };

export const validateRequestData = <
  ReqParamsSchema extends z.ZodTypeAny | undefined = undefined,
  ReqBodySchema extends z.ZodTypeAny | undefined = undefined,
  ReqQuerySchema extends z.ZodTypeAny | undefined = undefined
>(params: {
  req: Request;
  schemas: {
    params?: ReqParamsSchema;
    body?: ReqBodySchema;
    query?: ReqQuerySchema;
  };
}): ValidationResult<{
  params: ReqParamsSchema extends z.ZodType ? z.infer<ReqParamsSchema> : undefined;
  body: ReqBodySchema extends z.ZodType ? z.infer<ReqBodySchema> : undefined;
  query: ReqQuerySchema extends z.ZodType ? z.infer<ReqQuerySchema> : undefined;
}> => {
  const validatedData: {
    params: any;
    body: any;
    query: any;
  } = {
    params: undefined,
    body: undefined,
    query: undefined,
  };

  const { params: paramsSchema, body: bodySchema, query: querySchema } = params.schemas;

  // Validate request params
  if (paramsSchema) {
    const result = paramsSchema.safeParse(params.req.params);
    if (!result.success) {
      return {
        data: null,
        error: {
          message: "Invalid request parameters",
          details: result.error.issues,
        },
      };
    }
    validatedData.params = result.data;
  }

  // Validate request query
  if (querySchema) {
    const result = querySchema.safeParse(params.req.query);
    if (!result.success) {
      return {
        data: null,
        error: {
          message: "Invalid request query parameters",
          details: result.error.issues,
        },
      };
    }
    validatedData.query = result.data;
  }

  // Validate request body
  if (bodySchema) {
    const result = bodySchema.safeParse(params.req.body);
    if (!result.success) {
      return {
        data: null,
        error: {
          message: "Invalid request body",
          details: result.error.issues,
        },
      };
    }
    validatedData.body = result.data;
  }

  return {
    data: validatedData,
    error: null,
  };
};
