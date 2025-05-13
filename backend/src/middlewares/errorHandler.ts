import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }
  
  // Handle database errors
  if (err.message.includes('duplicate key') || err.message.includes('unique constraint')) {
    return res.status(409).json({
      message: 'A duplicate entry was detected'
    });
  }
  
  if (err.message.includes('Not enough stock')) {
    return res.status(400).json({
      message: err.message
    });
  }
  
  // Default error response
  return res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message })
  });
}; 