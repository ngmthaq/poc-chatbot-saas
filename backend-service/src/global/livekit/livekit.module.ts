import { Module } from '@nestjs/common';

import { LiveKitDispatchService } from './livekit-dispatch.service';
import { LiveKitEgressService } from './livekit-egress.service';
import { LiveKitIngressService } from './livekit-ingress.service';
import { LiveKitRoomService } from './livekit-room.service';
import { LiveKitSipService } from './livekit-sip.service';
import { LiveKitTokenService } from './livekit-token.service';
import { LiveKitWebhookController } from './livekit-webhook.controller';
import { LiveKitConfig } from './livekit.config';
import { liveKitClientProviders } from './livekit.tokens';

@Module({
  controllers: [LiveKitWebhookController],
  providers: [
    LiveKitConfig,
    ...liveKitClientProviders,
    LiveKitTokenService,
    LiveKitRoomService,
    LiveKitSipService,
    LiveKitEgressService,
    LiveKitIngressService,
    LiveKitDispatchService,
  ],
  exports: [
    LiveKitConfig,
    LiveKitTokenService,
    LiveKitRoomService,
    LiveKitSipService,
    LiveKitEgressService,
    LiveKitIngressService,
    LiveKitDispatchService,
  ],
})
export class LiveKitModule {}
