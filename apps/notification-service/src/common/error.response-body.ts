import { Response } from "express";

export interface ErrorResponseBody {
  error: string;
  details?: Record<string, any> | Record<string, any>[];
}

/**
 * Sends a standardized error response
 * @param res Express response object
 * @param status HTTP status code
 * @param error Error message
 * @param details Optional error details
 */
export const sendErrorResponse = (
  res: Response,
  status: number,
  error: string,
  details?: Record<string, any> | Record<string, any>[]
): void => {
  const errorResponse: ErrorResponseBody = { error };

  if (details) {
    errorResponse.details = details;
  }

  res.status(status).json(errorResponse);
};
