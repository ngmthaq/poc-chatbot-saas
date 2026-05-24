import { AccessToken } from 'livekit-server-sdk';
import type { AccessTokenOptions } from 'livekit-server-sdk';
import { loadConfig } from '../config/env';

export class LiveKitTokenUtil {
  private readonly config = loadConfig();

  /**
   * Mints a signed LiveKit JWT for a participant joining the given room.
   */
  public createAccessToken(options: AccessTokenOptions) {
    return new AccessToken(this.config.livekit.apiKey, this.config.livekit.apiSecret, options);
  }
}
