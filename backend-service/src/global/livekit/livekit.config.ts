import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LiveKitConfig {
  readonly url: string;
  readonly apiKey: string;
  readonly apiSecret: string;
  readonly webhookPath: string;
  readonly defaultTokenTtlSeconds: number;
  readonly sipTrunkId?: string;
  readonly agentName: string;

  constructor(config: ConfigService) {
    this.url = config.getOrThrow<string>('LIVEKIT_URL');
    this.apiKey = config.getOrThrow<string>('LIVEKIT_API_KEY');
    this.apiSecret = config.getOrThrow<string>('LIVEKIT_API_SECRET');
    this.webhookPath = config.getOrThrow<string>('LIVEKIT_WEBHOOK_PATH');
    this.defaultTokenTtlSeconds = config.getOrThrow<number>(
      'LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS',
    );
    const sipTrunkId = config.get<string>('LIVEKIT_SIP_TRUNK_ID');
    this.sipTrunkId =
      sipTrunkId !== undefined && sipTrunkId !== '' ? sipTrunkId : undefined;
    this.agentName = config.getOrThrow<string>('LIVEKIT_AGENT_NAME');

    Object.freeze(this);
  }
}
