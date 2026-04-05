import { ERROR_MESSAGES } from "@/lib/api/api-messages";
import { ApiError } from "./ApiError";
import { NextResponse } from "next/server";

type AsyncHandlerOptions<T> = {
  asyncFunction: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  setLoading: (loading: boolean) => void;
};

const asyncHandler = async (requestHandler: () => Promise<any>) => {
  try {
    return await requestHandler();
  } catch (err: any) {
    const isApiError = err instanceof ApiError;
    let message = err.message;
    let statusCode = isApiError ? err.statusCode : (err.status || 500);

    // Handle Prisma database errors
    if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
      message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      statusCode = 500;
    }

    // Handle raw SQL errors
    if (err.message && err.message.includes('Raw query failed')) {
      message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
      statusCode = 500;
    }

    // Handle PostgreSQL specific errors
    if (err.code === '42P01') {
      message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
      statusCode = 500;
    }

    // Handle connection errors
    if (err.message && err.message.includes('connect')) {
      message = ERROR_MESSAGES.CONNECTION_ERROR;
      statusCode = 503; // Service Unavailable
    }

    // Handle timeout errors
    if (err.message && (err.message.includes('timeout') || err.message.includes('TIMEOUT'))) {
      message = ERROR_MESSAGES.TIMEOUT_ERROR;
      statusCode = 408; // Request Timeout
    }

    // Fallback for unhandled errors
    if (!isApiError && message === err.message && !err.code) {
      message = ERROR_MESSAGES.GENERIC_ERROR;
      statusCode = 500;
    }

    // Only show detailed error information in development
    const errorDetails =
      process.env.NODE_ENV !== "production"
        ? { 
            originalMessage: err.message,
            code: err.code,
            stack: err.stack,
            ...(err.config && { config: err.config })
          }
        : {};

    const errorResponse = {
      success: false as const,
      message,
      ...errorDetails,
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}


export { asyncHandler };
