export interface ErrorResponseBody {
  error: string;
  details?: Record<string, any> | Record<string, any>[];
}
