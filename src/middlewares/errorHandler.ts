import type { NextFunction, Request, Response } from 'express';
import config from '../config/config.js';
import { validationResult } from 'express-validator';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  console.error(err);
  const showMessage = config.nodeEnv === 'development';
  return res.status(err.status || 500).json({
    message: showMessage
      ? err.message || 'Internal Server Error'
      : 'Internal Server Error',
  });
};

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: errors.array(),
    });
  }

  next();
};
