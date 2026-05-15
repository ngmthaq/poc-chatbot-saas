import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

import {
  LIVEKIT_AGENT_IDENTITY_PREFIX,
  LIVEKIT_CALLER_IDENTITY_PREFIX,
  LIVEKIT_SUPERVISOR_IDENTITY_PREFIX,
} from '../../shared/constants/livekit.constants';

import { LiveKitConfig } from './livekit.config';

import type {
  LiveKitAgentTokenOptions,
  LiveKitCallerTokenOptions,
  LiveKitSupervisorTokenOptions,
  LiveKitTokenOptions,
} from '../../shared/interfaces/livekit-token-options.interface';

@Injectable()
export class LiveKitTokenService {
  private readonly logger = new Logger(LiveKitTokenService.name);

  constructor(private readonly config: LiveKitConfig) {}

  async createAccessToken(options: LiveKitTokenOptions): Promise<string> {
    const ttlSeconds = options.ttlSeconds ?? this.config.defaultTokenTtlSeconds;
    const ctx = {
      identity: options.identity,
      roomName: options.roomName,
      ttlSeconds,
    };

    try {
      const token = new AccessToken(this.config.apiKey, this.config.apiSecret, {
        identity: options.identity,
        name: options.name,
        metadata: options.metadata,
        ttl: ttlSeconds,
      });

      token.addGrant({
        roomJoin: true,
        room: options.roomName,
        ...options.grants,
      });

      const jwt = await token.toJwt();
      this.logger.log(`createAccessToken ok ${JSON.stringify(ctx)}`);
      return jwt;
    } catch (err) {
      this.logger.error(
        `createAccessToken failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit createAccessToken failed',
      );
    }
  }

  private prefixIdentity(prefix: string, identity: string): string {
    return identity.startsWith(prefix) ? identity : `${prefix}${identity}`;
  }

  async createCallerToken(opts: LiveKitCallerTokenOptions): Promise<string> {
    return this.createAccessToken({
      ...opts,
      identity: this.prefixIdentity(
        LIVEKIT_CALLER_IDENTITY_PREFIX,
        opts.identity,
      ),
      grants: {
        canPublish: true,
        canSubscribe: true,
      },
    });
  }

  async createAgentToken(opts: LiveKitAgentTokenOptions): Promise<string> {
    return this.createAccessToken({
      ...opts,
      identity: this.prefixIdentity(
        LIVEKIT_AGENT_IDENTITY_PREFIX,
        opts.identity,
      ),
      grants: {
        agent: true,
        canPublishData: true,
      },
    });
  }

  async createSupervisorToken(
    opts: LiveKitSupervisorTokenOptions,
  ): Promise<string> {
    return this.createAccessToken({
      ...opts,
      identity: this.prefixIdentity(
        LIVEKIT_SUPERVISOR_IDENTITY_PREFIX,
        opts.identity,
      ),
      grants: {
        canPublish: true,
        canSubscribe: true,
        canUpdateOwnMetadata: true,
        ...(opts.hidden ? { hidden: true } : {}),
      },
    });
  }
}
