import type { ErrorRequestHandler } from 'express';
import createHttpError, { isHttpError } from 'http-errors';
import { errorMessages } from '../configs';
import { loadEnv } from '../configs';
import type { ErrorResponseBody } from '../types/error-handler';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const config = loadEnv();
  const httpError = isHttpError(err)
    ? err
    : createHttpError(500, normalizeMessage(err));
  const body: ErrorResponseBody = {
    status: httpError.status,
    message: httpError.message,
  };

  if (config.NODE_ENV !== 'production' && httpError.stack !== undefined) {
    body.stack = httpError.stack;
  }

  res.status(httpError.status).json(body);
};

const normalizeMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return errorMessages.internalServerError();
};
