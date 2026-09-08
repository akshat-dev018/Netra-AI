import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/appError.js';

type Schemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const fields: Record<string, string[]> = {};

    const run = (key: 'body' | 'query' | 'params', schema?: ZodType) => {
      if (!schema) return;
      const result = schema.safeParse(req[key]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const path = issue.path.join('.') || key;
          fields[path] = [...(fields[path] ?? []), issue.message];
        }
        return;
      }
      req[key] = result.data as typeof req.body;
    };

    run('body', schemas.body);
    run('query', schemas.query);
    run('params', schemas.params);

    if (Object.keys(fields).length > 0) {
      next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', fields));
      return;
    }
    next();
  };
}
