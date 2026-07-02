import bcrypt from 'bcrypt';

export class PasswordUtil {
  private readonly saltRounds = 12;

  /**
   * Hashes a plaintext password with bcrypt at cost factor 12 and returns the
   * `$2b$` digest (salt embedded). The plaintext is never logged or persisted
   * inside this util.
   *
   * Note: bcrypt only considers the first 72 bytes of the input and silently
   * ignores any bytes beyond that. Inputs are not pre-hashed (out of scope), so
   * passwords longer than 72 bytes are effectively truncated.
   */
  public async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  /**
   * Verifies a plaintext password against a stored bcrypt digest. Returns
   * `true` only on an exact match; returns `false` (never throws) for a wrong
   * password or a malformed/non-bcrypt stored hash. The plaintext is never
   * logged.
   */
  public async verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}

export const passwordUtil = new PasswordUtil();
