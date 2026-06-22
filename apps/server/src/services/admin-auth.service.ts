import { loadEnv } from '../configs';
import type {
  AdminLoginOptions,
  AdminLoginResult,
  AdminRefreshResult,
  AuthenticatedAdmin,
} from '../types/admin-auth';
import { AdminTokenUtil } from '../utils/admin-token.utils';
import { PasswordUtil } from '../utils/password.utils';
import { prisma } from '../utils/prisma.utils';
import type { AdminLoginBody } from '../validators/admin-login.validator';
import type { AdminLogoutBody } from '../validators/admin-logout.validator';
import type { AdminRefreshBody } from '../validators/admin-refresh.validator';

export class AdminAuthService {
  private readonly passwordUtil = new PasswordUtil();
  private readonly adminTokenUtil = new AdminTokenUtil();
  private readonly millisPerDay = 24 * 60 * 60 * 1000;

  // A fixed, valid bcrypt digest (cost 12) of a throwaway value. When the email
  // is unknown we still run a real bcrypt verify against this hash so the
  // response time does not reveal whether the account exists (anti-enumeration
  // / timing-attack mitigation). It is not a secret and gates nothing — no real
  // password ever matches it.
  private readonly dummyPasswordHash =
    '$2b$12$txREBCfb668XkwRD4cNyBOfTg9OgLylfVhprekSLr06Pox0pw8u.a';

  /**
   * Authenticates a platform admin by email + password. On success it mints a
   * JWT access token and an opaque refresh token, persists ONLY the refresh
   * token's hash in an `AdminSession`, stamps `lastLoginAt`, and returns the
   * tokens plus a minimal admin profile.
   *
   * Returns `null` (never throws) for every failure mode — unknown email, wrong
   * password, or an inactive account — so the controller can emit a single
   * generic 401 with no account enumeration. To equalize timing, a bcrypt
   * verify is performed against a fixed dummy hash when the email is unknown.
   * Passwords, tokens, and hashes are never logged.
   */
  public async login(
    body: AdminLoginBody,
    opts: AdminLoginOptions = {},
  ): Promise<AdminLoginResult | null> {
    const admin = await prisma.adminUser.findUnique({
      where: { email: body.email },
    });

    const passwordOk = await this.passwordUtil.verify(
      body.password,
      admin?.passwordHash ?? this.dummyPasswordHash,
    );

    if (admin === null || !passwordOk || !admin.isActive) {
      return null;
    }

    const { token: accessToken, expiresIn } =
      await this.adminTokenUtil.signAccessToken(admin.id);
    const refreshToken = this.adminTokenUtil.generateRefreshToken();

    const { ADMIN_REFRESH_TOKEN_TTL_DAYS } = loadEnv();
    const expiresAt = new Date(
      Date.now() + ADMIN_REFRESH_TOKEN_TTL_DAYS * this.millisPerDay,
    );

    await prisma.$transaction([
      prisma.adminSession.create({
        data: {
          adminUserId: admin.id,
          tokenHash: refreshToken.tokenHash,
          expiresAt,
          userAgent: opts.userAgent ?? null,
        },
      }),
      prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      refreshToken: refreshToken.raw,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  /**
   * Exchanges a valid opaque refresh token for a freshly minted access token and
   * a rotated refresh token, re-validating that the admin is still active.
   *
   * Rotation is atomic: the consumed `AdminSession` is revoked and a brand-new
   * session (new hash, fresh `ADMIN_REFRESH_TOKEN_TTL_DAYS` sliding window) is
   * created in a single transaction, so a refresh token is single-use.
   *
   * Reuse detection: presenting an already-revoked token is treated as theft and
   * revokes ALL of the admin's active sessions. Every failure mode — unknown,
   * expired, revoked, or inactive — returns `null` (never throws) so the
   * controller can emit a single generic 401 with no enumeration. The compare is
   * constant-time and tokens/hashes are never logged.
   */
  public async refresh(
    body: AdminRefreshBody,
    opts: AdminLoginOptions = {},
  ): Promise<AdminRefreshResult | null> {
    const tokenHash = this.adminTokenUtil.hashRefreshToken(body.refreshToken);
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash },
    });

    if (session === null) {
      return null;
    }

    if (!this.adminTokenUtil.hashesMatch(tokenHash, session.tokenHash)) {
      return null;
    }

    if (session.revokedAt !== null) {
      await this.revokeAllSessions(session.adminUserId);
      return null;
    }

    if (session.expiresAt <= new Date()) {
      await prisma.adminSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      return null;
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.adminUserId },
    });

    if (admin === null || !admin.isActive) {
      return null;
    }

    const { token: accessToken, expiresIn } =
      await this.adminTokenUtil.signAccessToken(admin.id);
    const refreshToken = this.adminTokenUtil.generateRefreshToken();

    const { ADMIN_REFRESH_TOKEN_TTL_DAYS } = loadEnv();
    const expiresAt = new Date(
      Date.now() + ADMIN_REFRESH_TOKEN_TTL_DAYS * this.millisPerDay,
    );

    await prisma.$transaction([
      prisma.adminSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      }),
      prisma.adminSession.create({
        data: {
          adminUserId: admin.id,
          tokenHash: refreshToken.tokenHash,
          expiresAt,
          userAgent: opts.userAgent ?? null,
        },
      }),
    ]);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      refreshToken: refreshToken.raw,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  /**
   * Authenticates a request-bearing access token: verifies the JWT signature
   * and expiry via `AdminTokenUtil.verifyAccessToken`, then re-loads the live
   * `AdminUser` by its `sub` claim and confirms it is still active. The record
   * is fetched with `passwordHash` omitted, so the returned value can be safely
   * attached to the request.
   *
   * Returns `null` (never throws) for EVERY failure mode — invalid/expired/
   * wrong-algorithm token, a missing or non-string `sub`, an unknown admin, or
   * an inactive admin — so the caller emits a single generic 401 that reveals
   * nothing about which check failed (no enumeration). The access token is never
   * logged.
   */
  public async authenticateAccessToken(
    token: string,
  ): Promise<AuthenticatedAdmin | null> {
    let sub: string;
    try {
      const { payload } = await this.adminTokenUtil.verifyAccessToken(token);
      if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
        return null;
      }
      sub = payload.sub;
    } catch {
      return null;
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: sub },
      omit: { passwordHash: true },
    });

    if (admin === null || !admin.isActive) {
      return null;
    }

    return admin;
  }

  /**
   * Logs out a single admin session by revoking the one `AdminSession` whose
   * hash matches the presented refresh token. Uses `updateMany` filtered on the
   * unique `tokenHash`, so it touches at most one row and is fully idempotent:
   * an unknown, already-revoked, or expired token simply affects 0 rows and
   * never throws. Other sessions for the same admin are untouched. The behavior
   * is constant — it reveals nothing about whether the token existed or was
   * active (no enumeration) — and the raw token and its hash are never logged.
   */
  public async logout(body: AdminLogoutBody): Promise<void> {
    const tokenHash = this.adminTokenUtil.hashRefreshToken(body.refreshToken);

    await prisma.adminSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revokes every still-active (`revokedAt === null`) session for the given
   * admin. Used by reuse detection: replaying an already-revoked refresh token
   * signals theft, so the entire session family is invalidated.
   */
  private async revokeAllSessions(adminUserId: string): Promise<void> {
    await prisma.adminSession.updateMany({
      where: { adminUserId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
