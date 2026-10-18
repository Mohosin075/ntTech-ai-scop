import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import config from '../../config';
import AppError from '../errors/AppError';
import { IAuthUser } from '../modules/auth/auth.interface';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Authentication required. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as IAuthUser;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(StatusCodes.UNAUTHORIZED, 'Token has expired. Please log in again.'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(StatusCodes.UNAUTHORIZED, 'Invalid authentication token.'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...requiredRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Authentication required.');
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(req.user.role)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          `Forbidden: You do not have permission to perform this action. Required role: ${requiredRoles.join(' or ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default { authenticate, authorize };
