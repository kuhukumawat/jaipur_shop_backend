import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, any>;
  errors?: Record<string, { message: string }>;
  path?: string;
  value?: any;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Value'} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
