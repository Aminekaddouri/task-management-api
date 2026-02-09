import { Request, Response, NextFunction } from 'express';
import { url } from 'inspector';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong!';

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Log error (in production, using proper logging service)
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV == 'development' && { stack: err.stack }),
  });
};

// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
};