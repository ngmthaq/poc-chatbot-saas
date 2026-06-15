import type { ErrorRequestHandler } from 'express';
import createHttpError, { isHttpError } from 'http-errors';
import type { ErrorResponseBody } from '../../types/chat';
import { logger } from '../utils/logger.utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const httpError = isHttpError(err)
    ? err
    : createHttpError(500, 'Internal server error');

  if (httpError.status >= 500) {
    logger.error({ err }, 'Unhandled error');
  } else {
    logger.warn({ err: httpError.message }, 'Request error');
  }

  const body: ErrorResponseBody = {
    status: httpError.status,
    message: httpError.expose ? httpError.message : 'Internal server error',
  };

  res.status(httpError.status).json(body);
};
