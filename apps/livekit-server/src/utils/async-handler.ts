import type { RequestHandler } from 'express';
import type { AsyncRequestHandler } from '../types/async-handler';

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
