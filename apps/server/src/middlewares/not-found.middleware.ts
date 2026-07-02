import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { errorMessages } from '../configs';

export class NotFoundMiddleware {
  public handle: RequestHandler = (_req, _res, next) => {
    next(createHttpError(404, errorMessages.notFound()));
  };
}

export const notFoundMiddleware = new NotFoundMiddleware();
