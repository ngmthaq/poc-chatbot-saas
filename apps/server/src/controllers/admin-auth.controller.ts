import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { errorMessages } from '../configs';
import { AdminAuthService } from '../services/admin-auth.service';
import type { AdminLogoutResult } from '../types/admin-auth';
import type { AdminLoginBody } from '../validators/admin-login.validator';
import type { AdminLogoutBody } from '../validators/admin-logout.validator';
import type { AdminRefreshBody } from '../validators/admin-refresh.validator';

export class AdminAuthController {
  private readonly adminAuthService = new AdminAuthService();

  /**
   * Handles `POST /admin/auth/login`. On valid credentials it returns the login
   * result (tokens + minimal admin profile) for `responseHandler` to wrap with
   * a 200. Every failure mode collapses to a single generic 401 with no account
   * enumeration.
   */
  public readonly handleLogin: RequestHandler = async (req) => {
    const result = await this.adminAuthService.login(
      req.body as AdminLoginBody,
      {
        userAgent: req.get('user-agent') ?? undefined,
      },
    );

    if (result === null) {
      throw createHttpError(401, errorMessages.invalidCredentials());
    }

    return result;
  };

  /**
   * Handles `POST /admin/auth/refresh`. On a valid, unexpired, non-revoked
   * refresh token for an active admin it returns the rotated tokens plus the
   * minimal admin profile for `responseHandler` to wrap with a 200. Every
   * failure mode collapses to a single generic 401 with no enumeration.
   */
  public readonly handleRefresh: RequestHandler = async (req) => {
    const result = await this.adminAuthService.refresh(
      req.body as AdminRefreshBody,
      {
        userAgent: req.get('user-agent') ?? undefined,
      },
    );

    if (result === null) {
      throw createHttpError(401, errorMessages.invalidRefreshToken());
    }

    return result;
  };

  /**
   * Handles `POST /admin/auth/logout`. Revokes the single session matching the
   * presented refresh token and always returns `{ revoked: true }` for
   * `responseHandler` to wrap with a 200. Idempotent with no error branch — an
   * unknown, already-revoked, or expired token yields the same response, so the
   * endpoint never reveals whether the token existed or was active.
   */
  public readonly handleLogout: RequestHandler = async (req) => {
    await this.adminAuthService.logout(req.body as AdminLogoutBody);

    return { revoked: true } satisfies AdminLogoutResult;
  };
}
