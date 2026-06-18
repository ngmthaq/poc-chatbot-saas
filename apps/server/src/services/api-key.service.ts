import { ApiKeyStatus } from '@prisma/client';
import type { ApiKey } from '@prisma/client';
import { timingSafeEqual } from 'node:crypto';
import { ApiKeyUtil } from '../utils/api-key.utils';
import { prisma } from '../utils/prisma.utils';

export class ApiKeyService {
  private readonly apiKeyUtil = new ApiKeyUtil();

  /**
   * Verifies a raw API key against the stored records and returns the matching
   * ApiKey when it is valid, or `null` otherwise. This path is read-only — it
   * never mutates a row (the `lastUsedAt` touch lives elsewhere).
   *
   * Because `keyHash` is a deterministic SHA-256 digest already used as a unique
   * lookup column, a plain `timingSafeEqual` over the digests is sufficient and
   * appropriate here: it removes the timing side-channel of a naive string
   * compare without the cost of a slow KDF, which would be redundant for a
   * high-entropy random key.
   */
  public async verifyKey(raw: string): Promise<ApiKey | null> {
    if (typeof raw !== 'string' || raw.length === 0) {
      return null;
    }

    const keyHash = this.apiKeyUtil.hashKey(raw);
    const record = await prisma.apiKey.findUnique({ where: { keyHash } });

    if (record === null) {
      return null;
    }

    if (!this.hashesMatch(keyHash, record.keyHash)) {
      return null;
    }

    if (record.status !== ApiKeyStatus.ACTIVE) {
      return null;
    }

    if (record.revokedAt !== null) {
      return null;
    }

    if (record.expiresAt !== null && record.expiresAt <= new Date()) {
      return null;
    }

    return record;
  }

  /**
   * Constant-time comparison of two hex-encoded digests. Returns `false` when
   * the buffers differ in length instead of letting `timingSafeEqual` throw.
   */
  private hashesMatch(computed: string, stored: string): boolean {
    const computedBuffer = Buffer.from(computed, 'hex');
    const storedBuffer = Buffer.from(stored, 'hex');

    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return timingSafeEqual(computedBuffer, storedBuffer);
  }
}
