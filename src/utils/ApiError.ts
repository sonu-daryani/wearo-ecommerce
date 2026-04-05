class ApiError extends Error {
  statusCode: number;
  data?: unknown;
  success: boolean;
  errors: unknown[];

  constructor(statusCode = 500, message = "Something went wrong", errors: unknown[] = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
      if (process.env.NODE_ENV !== "production") {
        console.error("[ApiError]", message, stack);
      }
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
