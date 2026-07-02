import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { errorMessages } from '../configs';
import { ApiKeyService } from '../services/api-key.service';
import { loggerUtil } from '../utils/logger.utils';

/**
 * Authenticates a request by its API key and injects the tenant context.
 *
 * Returns a 401 when the `Authorization` header is missing, malformed, or the
 * key is invalid (a single generic message avoids leaking whether a key exists
 * versus is expired). On success the verified record is attached to `req.apiKey`,
 * the derived tenant context is attached to `req.context`, and `lastUsedAt` is
 * touched on a best-effort basis that can never fail the request. Scope
 * enforcement is handled separately by the `requireScopes` middleware.
 */
export class ApiKeyAuthMiddleware {
  private readonly apiKeyService = new ApiKeyService();

  public handle: RequestHandler = async (req, _res, next) => {
    try {
      const raw = this.parseBearerToken(req.headers.authorization);
      if (raw === null) {
        return next(createHttpError(401, errorMessages.unauthorized()));
      }

      const record = await this.apiKeyService.verifyKey(raw);
      if (record === null) {
        return next(createHttpError(401, errorMessages.unauthorized()));
      }

      req.apiKey = record;
      req.context = {
        tenantId: record.tenantId,
        apiKeyId: record.id,
        scopes: record.scopes,
        botId: record.botId,
      };

      try {
        await this.apiKeyService.touchLastUsed(record.id);
      } catch (err) {
        loggerUtil.instance.warn(
          { err },
          'Failed to update API key lastUsedAt',
        );
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Parses the raw API key from an `Authorization: Bearer <token>` header,
   * returning `null` when the header is missing or malformed.
   */
  private parseBearerToken(header: string | undefined): string | null {
    if (header === undefined) {
      return null;
    }

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || token === undefined || token.length === 0) {
      return null;
    }

    return token;
  }
}

export const apiKeyAuthMiddleware = new ApiKeyAuthMiddleware();
