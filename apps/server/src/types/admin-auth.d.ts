import type { AdminUser } from '@prisma/client';
import type { JWTPayload } from 'jose';

/**
 * An authenticated admin attached to the request by the `adminAuth` guard: the
 * full `AdminUser` record with `passwordHash` stripped so the secret never
 * reaches handlers or the request object.
 */
export type AuthenticatedAdmin = Omit<AdminUser, 'passwordHash'>;

/**
 * Public-facing admin identity returned in the login response body.
 */
export interface AdminPublicProfile {
  id: string;
  email: string;
  name: string;
}

/**
 * Signed access-token JWT claims. `sub` carries the AdminUser id; the standard
 * claims (`iat`, `exp`, ...) are inherited from `JWTPayload`.
 */
export interface AdminAccessTokenPayload extends JWTPayload {
  sub: string;
}

/**
 * A minted access token plus its lifetime (seconds) for the response body.
 */
export interface SignedAccessToken {
  token: string;
  expiresIn: number;
}

/**
 * A generated opaque refresh token: the raw value (returned to the client once)
 * and its one-way hash (the only form persisted in AdminSession).
 */
export interface GeneratedRefreshToken {
  raw: string;
  tokenHash: string;
}

/**
 * Successful login outcome, returned by AdminAuthService.login.
 */
export interface AdminLoginResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshToken: string;
  admin: AdminPublicProfile;
}

/**
 * Optional per-request context passed into AdminAuthService.login.
 */
export interface AdminLoginOptions {
  userAgent?: string | undefined;
}

/**
 * Successful refresh outcome, returned by AdminAuthService.refresh. Mirrors the
 * login result: a freshly minted access token plus a rotated refresh token.
 */
export type AdminRefreshResult = AdminLoginResult;

/**
 * Logout outcome returned by the controller. Always `{ revoked: true }` so the
 * response is constant and reveals nothing about whether the token existed or
 * was active (idempotent, no enumeration).
 */
export interface AdminLogoutResult {
  revoked: true;
}
