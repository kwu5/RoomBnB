import { Request, Response, NextFunction } from 'express';

class AppError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode: number = 500, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors,
    });
  }

  console.error('Unexpected error:', err);

  return res.status(500).json({
    message: 'Internal server error',
  });
};

export { errorHandler, AppError };
