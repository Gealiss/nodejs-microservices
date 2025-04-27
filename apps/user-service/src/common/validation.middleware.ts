import { RequestHandler } from "express";
import { SomeZodObject, ZodIssue } from "zod";
import { ErrorResponseBody } from "./error.response-body.js";

const validateAndTransform = (
  schema: SomeZodObject,
  data: Record<string, any>
):
  | { data: null; error: { message: string; details: ZodIssue[] } }
  | { data: Record<string, any>; error: null } => {
  // Parse, validate and transform data (if specified in schema)
  const parseResult = schema.safeParse(data);
  if (!parseResult.success) {
    return {
      error: { message: parseResult.error.message, details: parseResult.error.issues },
      data: null,
    };
  }

  return { data: parseResult.data, error: null };
};

export const validateAndTransformMiddleware: (
  schemas: Partial<{
    params: SomeZodObject;
    body: SomeZodObject;
    query: SomeZodObject;
  }>
  // TODO: improve types
) => RequestHandler<any, any, any, any> = (schemas) => (req, res, next) => {
  // Validate request params
  if (schemas.params) {
    const result = validateAndTransform(schemas.params, req.params);
    if (result.error) {
      const responseBody: ErrorResponseBody = {
        error: `Invalid request parameters. ${result.error.message}`,
        details: result.error.details,
      };
      res.status(400).json(responseBody);
      return;
    } else {
      // Overwrite current request params
      req.params = result.data;
    }
  }

  // Validate request query
  if (schemas.query) {
    const result = validateAndTransform(schemas.query, req.query);
    if (result.error) {
      const responseBody: ErrorResponseBody = {
        error: `Invalid request query parameters. ${result.error.message}`,
        details: result.error.details,
      };
      res.status(400).json(responseBody);
      return;
    } else {
      // Overwrite current request query params
      req.query = result.data;
    }
  }

  // Validate request body
  if (schemas.body) {
    const result = validateAndTransform(schemas.body, req.body);
    if (result.error) {
      const responseBody: ErrorResponseBody = {
        error: `Invalid request body. ${result.error.message}`,
        details: result.error.details,
      };
      res.status(400).json(responseBody);
      return;
    } else {
      // Overwrite current request body
      req.body = result.data;
    }
  }

  next();
};
