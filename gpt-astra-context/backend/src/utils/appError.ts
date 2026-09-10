export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly fields?: Record<string, string[]>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
  }
}

export function notFound(message = 'Resource not found'): AppError {
  return new AppError(404, 'NOT_FOUND', message);
}

export function unauthorized(code = 'UNAUTHORIZED', message = 'Authentication required'): AppError {
  return new AppError(401, code, message);
}

export function forbidden(code = 'FORBIDDEN', message = 'Insufficient permissions'): AppError {
  return new AppError(403, code, message);
}
