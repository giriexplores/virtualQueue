import type { Request, Response, NextFunction } from 'express';
import { createLogger } from '../services/logger';

const logger = createLogger('errorHandler');

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT_ERROR');
  }
}

interface ErrorResponse {
  error: string;
  code?: string;
  stack?: string;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn({
      err,
      path: req.path,
      method: req.method,
      statusCode: err.statusCode,
      code: err.code,
    }, err.message);

    const response: ErrorResponse = {
      error: err.message,
      code: err.code,
    };

    if (process.env.NODE_ENV !== 'production') {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  logger.error({
    err,
    path: req.path,
    method: req.method,
  }, 'Unexpected error');

  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}