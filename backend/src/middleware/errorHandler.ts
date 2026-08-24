import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400, "BAD_REQUEST");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "RESOURCE_NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

export class ValidationError extends AppError {
  public readonly details: unknown;
  constructor(message = "Validation error", details?: unknown) {
    super(message, 422, "VALIDATION_ERROR");
    this.details = details;
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429, "TOO_MANY_REQUESTS");
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, "INTERNAL_SERVER_ERROR", false);
  }
}

export function errorHandler(err: Error & { type?: string; statusCode?: number }, req: Request, res: Response, _next: NextFunction): void {
  // Body-parser failures (malformed JSON, oversized payloads) are client errors.
  if (err.type === "entity.parse.failed" || err.type === "entity.too.large" || err instanceof SyntaxError && err.statusCode === 400) {
    res.status(err.type === "entity.too.large" ? 413 : 400).json({
      success: false,
      error: { code: err.type === "entity.too.large" ? "PAYLOAD_TOO_LARGE" : "BAD_REQUEST", message: "Invalid request body" },
    });
    return;
  }

  // CORS origin rejections are client errors, not server faults.
  if (err.message?.includes("not allowed by CORS")) {
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Origin not allowed" },
    });
    return;
  }

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err instanceof ValidationError ? err.details : undefined,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  console.error("Unhandled error:", err);
  const response: ApiResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    },
  };
  res.status(500).json(response);
}
