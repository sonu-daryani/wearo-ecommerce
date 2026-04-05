/** Defaults for routeAsyncHandler when errors are not ApiError instances. */
export const ERROR_MESSAGES = {
  GENERIC_ERROR: "Something went wrong.",
  INTERNAL_SERVER_ERROR: "Internal server error.",
  CONNECTION_ERROR: "Service temporarily unavailable.",
  TIMEOUT_ERROR: "Request timed out.",
} as const;
