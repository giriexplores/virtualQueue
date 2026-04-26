import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      throw new AppError(400, `Validation failed: ${errors.join(', ')}`);
    }
    req.body = result.data;
    next();
  };
}