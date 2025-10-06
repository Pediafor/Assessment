import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../types';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  throw new NotFoundError(`Route ${req.originalUrl} not found`);
};