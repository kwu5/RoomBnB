import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthRequest } from '../types';
import { AppError } from './errorHandler';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      isHost: boolean;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const requireHost = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isHost) {
    return next(new AppError('Host privileges required', 403));
  }
  next();
};
