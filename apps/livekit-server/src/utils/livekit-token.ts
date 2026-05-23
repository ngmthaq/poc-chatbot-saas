import { AccessToken } from 'livekit-server-sdk';
import type { AccessTokenOptions } from 'livekit-server-sdk';
import { loadConfig } from '../config/env';
import type { CreateAccessTokenInput } from '../types/livekit-token';

export class LiveKitTokenUtil {
  private readonly config = loadConfig();
  private readonly apiKey = this.config.livekit.apiKey;
  private readonly apiSecret = this.config.livekit.apiSecret;

  /**
   * Mints a signed LiveKit JWT for a participant joining the given room.
   */
  public async createAccessToken(input: CreateAccessTokenInput): Promise<string> {
    const options: AccessTokenOptions = { identity: input.identity };
    if (input.name !== undefined) options.name = input.name;
    if (input.metadata !== undefined) options.metadata = input.metadata;
    if (input.ttl !== undefined) options.ttl = input.ttl;
    const at = new AccessToken(this.apiKey, this.apiSecret, options);
    at.addGrant({ roomJoin: true, room: input.roomName, ...(input.grants ?? {}) });
    return await at.toJwt();
  }
}
