import { ApiKeyScope } from '@prisma/client';
import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { errorMessages } from '../configs';
import { ApiKeyService } from '../services/api-key.service';
import { logger } from '../utils/logger.utils';

const apiKeyService = new ApiKeyService();

/**
 * Parses the raw API key from an `Authorization: Bearer <token>` header,
 * returning `null` when the header is missing or malformed.
 */
function parseBearerToken(header: string | undefined): string | null {
  if (header === undefined) {
    return null;
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || token === undefined || token.length === 0) {
    return null;
  }

  return token;
}

/**
 * Authenticates a request by its API key and enforces the given scopes.
 *
 * Returns a 401 when the `Authorization` header is missing, malformed, or the
 * key is invalid (a single generic message avoids leaking whether a key exists
 * versus is expired), and a 403 when the key lacks a required scope. On success
 * the verified record is attached to `req.apiKey` and `lastUsedAt` is touched on
 * a best-effort basis that can never fail the request.
 */
export function apiKeyAuth(requiredScopes: ApiKeyScope[] = []): RequestHandler {
  return async (req, _res, next) => {
    try {
      const raw = parseBearerToken(req.headers.authorization);
      if (raw === null) {
        return next(createHttpError(401, errorMessages.unauthorized()));
      }

      const record = await apiKeyService.verifyKey(raw);
      if (record === null) {
        return next(createHttpError(401, errorMessages.unauthorized()));
      }

      if (!apiKeyService.hasRequiredScopes(record, requiredScopes)) {
        return next(createHttpError(403, errorMessages.forbidden()));
      }

      req.apiKey = record;

      try {
        await apiKeyService.touchLastUsed(record.id);
      } catch (err) {
        logger.warn({ err }, 'Failed to update API key lastUsedAt');
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
