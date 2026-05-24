import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { SuccessResponseBody } from '../types/response-handler';

export const responseHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .then((result) => {
        if (res.headersSent) return;
        const status = res.statusCode;
        const body: SuccessResponseBody = {
          status,
          data: result ?? null,
          timestamp: new Date().toISOString(),
        };
        res.status(status).json(body);
      })
      .catch(next);
  };
};
