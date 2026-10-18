import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import config from '../../config';
import AppError from '../errors/AppError';

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let message: string = 'Something went wrong!';
  let errorSources: Array<{ path: string | number; message: string }> = [];

  // Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Zod Validation Error
  else if (err instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation Error';
    errorSources = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1] ?? '',
      message: issue.message,
    }));
  }
  // Prisma Duplicate Key Error
  else if (err?.code === 'P2002') {
    statusCode = StatusCodes.CONFLICT;
    const target = (err.meta?.target as string[])?.join(', ') || 'field';
    message = `Duplicate value already exists for: ${target}`;
  }
  // Prisma Record Not Found
  else if (err?.code === 'P2025') {
    statusCode = StatusCodes.NOT_FOUND;
    message = 'Requested record was not found';
  }
  // Generic JS Error
  else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errorSources.length > 0 && { errorSources }),
    ...(config.env === 'development' && { stack: err?.stack }),
  });
};

export default globalErrorHandler;
