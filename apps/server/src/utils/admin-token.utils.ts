import { SignJWT, jwtVerify } from 'jose';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { loadEnv } from '../configs';
import type {
  AdminAccessTokenPayload,
  GeneratedRefreshToken,
  SignedAccessToken,
} from '../types/admin-auth';

export class AdminTokenUtil {
  private readonly refreshTokenByteLength = 32;
  private readonly hashAlgorithm = 'sha256';
  private readonly jwtAlgorithm = 'HS256';

  /**
   * Signs a short-lived JWT access token whose subject is the admin id. The TTL
   * and signing secret are sourced from the validated env (`ADMIN_JWT_SECRET`,
   * `ADMIN_ACCESS_TOKEN_TTL`). Returns the compact JWT together with its
   * lifetime in seconds for the response body. The secret is never logged.
   */
  public async signAccessToken(
    adminUserId: string,
  ): Promise<SignedAccessToken> {
    const { ADMIN_JWT_SECRET, ADMIN_ACCESS_TOKEN_TTL } = loadEnv();
    const issuedAt = Math.floor(Date.now() / 1000);

    const token = await new SignJWT({})
      .setProtectedHeader({ alg: this.jwtAlgorithm })
      .setSubject(adminUserId)
      .setIssuedAt(issuedAt)
      .setExpirationTime(ADMIN_ACCESS_TOKEN_TTL)
      .sign(this.secretKey(ADMIN_JWT_SECRET));

    const { payload } = await this.verifyAccessToken(token);
    const expiresIn = (payload.exp ?? issuedAt) - issuedAt;

    return { token, expiresIn };
  }

  /**
   * Verifies a JWT access token's signature and expiry using the env secret,
   * returning the decoded payload. Throws (via `jose`) on an invalid/expired
   * token; callers decide how to map that failure.
   */
  public async verifyAccessToken(
    token: string,
  ): Promise<{ payload: AdminAccessTokenPayload }> {
    const { ADMIN_JWT_SECRET } = loadEnv();
    const { payload } = await jwtVerify(
      token,
      this.secretKey(ADMIN_JWT_SECRET),
      {
        algorithms: [this.jwtAlgorithm],
      },
    );

    return { payload: payload as AdminAccessTokenPayload };
  }

  /**
   * Generates a high-entropy opaque refresh token (32 random bytes, base64url)
   * and its deterministic SHA-256 hash. Only the hash is persisted; the raw
   * value is returned to the caller once and is never logged inside this util.
   */
  public generateRefreshToken(): GeneratedRefreshToken {
    const raw = randomBytes(this.refreshTokenByteLength).toString('base64url');
    const tokenHash = this.hashRefreshToken(raw);

    return { raw, tokenHash };
  }

  /**
   * Derives the deterministic SHA-256 hex digest of a raw refresh token, used
   * for unique lookup by `tokenHash`. Determinism is required for the lookup, so
   * this is a plain hash (a slow KDF would be redundant for a high-entropy
   * random token).
   */
  public hashRefreshToken(raw: string): string {
    return createHash(this.hashAlgorithm).update(raw).digest('hex');
  }

  /**
   * Constant-time comparison of two hex-encoded digests. Returns `false` when
   * the buffers differ in length instead of letting `timingSafeEqual` throw.
   */
  public hashesMatch(computed: string, stored: string): boolean {
    const computedBuffer = Buffer.from(computed, 'hex');
    const storedBuffer = Buffer.from(stored, 'hex');

    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return timingSafeEqual(computedBuffer, storedBuffer);
  }

  private secretKey(secret: string): Uint8Array {
    return new TextEncoder().encode(secret);
  }
}
