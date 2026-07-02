import type { ApiKeyScope } from '@prisma/client';
import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { errorMessages } from '../configs';
import { ApiKeyService } from '../services/api-key.service';

/**
 * Enforces that the authenticated request holds every scope in `required`.
 *
 * Fail-closed: when `req.context` is absent (e.g. this middleware runs without
 * `apiKeyAuth` ahead of it) the request is rejected with a 401 rather than
 * passing through. When the context is present but lacks a required scope a 403
 * is returned. Both messages are generic so they never reveal which scope is
 * missing. Must be mounted after `apiKeyAuth`.
 */
export class RequireScopesMiddleware {
  private readonly apiKeyService = new ApiKeyService();

  public handle = (...required: ApiKeyScope[]): RequestHandler => {
    return (req, _res, next) => {
      if (req.context === undefined) {
        return next(createHttpError(401, errorMessages.unauthorized()));
      }

      if (!this.apiKeyService.hasRequiredScopes(req.context.scopes, required)) {
        return next(createHttpError(403, errorMessages.forbidden()));
      }

      return next();
    };
  };
}

export const requireScopesMiddleware = new RequireScopesMiddleware();
