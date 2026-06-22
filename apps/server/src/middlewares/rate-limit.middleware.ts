import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import createHttpError from 'http-errors';
import { errorMessages } from '../configs';
import { loadEnv } from '../configs';

export const rateLimitHandler: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => loadEnv().NODE_ENV === 'development',
  handler: (_req, _res, next) => {
    next(createHttpError(429, errorMessages.tooManyRequests()));
  },
});

// Stricter, IP-keyed limiter for authentication endpoints (e.g. admin login)
// to blunt credential-stuffing / brute-force attempts. Skipped in development
// like the global limiter.
export const authRateLimitHandler: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => loadEnv().NODE_ENV === 'development',
  handler: (_req, _res, next) => {
    next(createHttpError(429, errorMessages.tooManyAuthAttempts()));
  },
});
