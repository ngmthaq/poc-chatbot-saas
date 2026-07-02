import { createHash, randomBytes } from 'node:crypto';
import type { GeneratedApiKey } from '../types/api-key';

export class ApiKeyUtil {
  private readonly keyByteLength = 32;
  private readonly keyPrefixLength = 8;
  private readonly hashAlgorithm = 'sha256';

  /**
   * Generates a high-entropy raw API key and derives its deterministic
   * SHA-256 hash and display prefix. The raw value is returned to the caller
   * but is never logged or persisted inside this util.
   */
  public generateKey(): GeneratedApiKey {
    const raw = randomBytes(this.keyByteLength).toString('base64url');
    const keyPrefix = raw.slice(0, this.keyPrefixLength);
    const keyHash = this.hashKey(raw);

    return { raw, keyHash, keyPrefix };
  }

  /**
   * Derives the deterministic SHA-256 hex digest of a raw API key, used for
   * unique lookup by `keyHash`. Determinism is required, so this is a plain
   * hash (not bcrypt/argon2/HMAC).
   */
  public hashKey(raw: string): string {
    return createHash(this.hashAlgorithm).update(raw).digest('hex');
  }
}

export const apiKeyUtil = new ApiKeyUtil();
