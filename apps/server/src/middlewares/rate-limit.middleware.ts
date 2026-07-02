import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import createHttpError from 'http-errors';
import { errorMessages } from '../configs';
import { loadEnv } from '../configs';
import { ApiKeyService } from '../services/api-key.service';
import { loggerUtil } from '../utils/logger.utils';

export class GlobalRateLimitMiddleware {
  public handle: RequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => loadEnv().NODE_ENV === 'development',
    handler: (_req, _res, next) => {
      next(createHttpError(429, errorMessages.tooManyRequests()));
    },
  });
}

export const globalRateLimitMiddleware = new GlobalRateLimitMiddleware();

/**
 * Stricter, IP-keyed limiter for authentication endpoints (e.g. admin login)
 * to blunt credential-stuffing / brute-force attempts. Skipped in development
 * like the global limiter.
 */
export class AuthRateLimitMiddleware {
  public handle: RequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => loadEnv().NODE_ENV === 'development',
    handler: (_req, _res, next) => {
      next(createHttpError(429, errorMessages.tooManyAuthAttempts()));
    },
  });
}

export const authRateLimitMiddleware = new AuthRateLimitMiddleware();

/**
 * DB-backed, per-API-key rate limiter. Floors the request time into a fixed
 * window, atomically increments the per-key usage counter, and rejects with a
 * 429 (plus `Retry-After` / `X-RateLimit-*` headers) once the window's request
 * count exceeds the configured max. Runs in all environments — unlike the
 * IP-keyed limiters above — because it also meters per-key usage. Fails open:
 * if the counter cannot be read/written the request is allowed through.
 */
export class ApiKeyRateLimitMiddleware {
  private readonly apiKeyService = new ApiKeyService();

  public handle: RequestHandler = async (req, res, next) => {
    try {
      const { RATE_LIMIT_WINDOW_MS: windowMs, RATE_LIMIT_MAX: max } = loadEnv();

      if (req.context === undefined) {
        return next();
      }

      const now = Date.now();
      const windowStart = new Date(Math.floor(now / windowMs) * windowMs);

      try {
        const usage = await this.apiKeyService.incrementUsage(
          req.context.apiKeyId,
          windowStart,
        );
        const remaining = Math.max(0, max - usage.requestCount);

        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', remaining);

        if (usage.requestCount > max) {
          const retryAfterSeconds = Math.ceil(
            (windowStart.getTime() + windowMs - now) / 1000,
          );
          res.setHeader('Retry-After', retryAfterSeconds);
          return next(createHttpError(429, errorMessages.tooManyRequests()));
        }

        return next();
      } catch (err) {
        loggerUtil.instance.warn(
          { err },
          'Rate-limit counter failed; allowing request (fail-open)',
        );
        return next();
      }
    } catch (err) {
      return next(err);
    }
  };
}

export const apiKeyRateLimitMiddleware = new ApiKeyRateLimitMiddleware();
