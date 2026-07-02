import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { errorMessages } from '../configs';
import { AdminAuthService } from '../services/admin-auth.service';

/**
 * Authenticates a request by its admin access-token JWT and attaches the live,
 * sanitized admin to `req.adminUser`.
 *
 * Returns a 401 when the `Authorization` header is missing/malformed or the
 * token fails verification (a single generic message avoids leaking whether the
 * token was invalid, expired, or for an unknown/inactive admin). On success the
 * `AdminUser` record — with `passwordHash` omitted — is attached to
 * `req.adminUser`. Unexpected errors are forwarded to the central error handler.
 */
export class AdminAuthMiddleware {
  private readonly adminAuthService = new AdminAuthService();

  public handle: RequestHandler = async (req, _res, next) => {
    try {
      const token = this.parseBearerToken(req.headers.authorization);
      if (token === null) {
        return next(createHttpError(401, errorMessages.unauthorized()));
      }

      const admin = await this.adminAuthService.authenticateAccessToken(token);
      if (admin === null) {
        return next(createHttpError(401, errorMessages.unauthorized()));
      }

      req.adminUser = admin;
      return next();
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Parses the raw access token from an `Authorization: Bearer <token>` header,
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

export const adminAuthMiddleware = new AdminAuthMiddleware();
