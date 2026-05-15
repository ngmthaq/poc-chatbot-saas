import {
  AgentDispatchClient,
  EgressClient,
  IngressClient,
  RoomServiceClient,
  SipClient,
} from 'livekit-server-sdk';

import { LiveKitConfig } from './livekit.config';

import type { Provider } from '@nestjs/common';

export const LIVEKIT_ROOM_CLIENT = 'LIVEKIT_ROOM_CLIENT' as const;
export const LIVEKIT_SIP_CLIENT = 'LIVEKIT_SIP_CLIENT' as const;
export const LIVEKIT_EGRESS_CLIENT = 'LIVEKIT_EGRESS_CLIENT' as const;
export const LIVEKIT_INGRESS_CLIENT = 'LIVEKIT_INGRESS_CLIENT' as const;
export const LIVEKIT_AGENT_DISPATCH_CLIENT =
  'LIVEKIT_AGENT_DISPATCH_CLIENT' as const;

export const liveKitClientProviders: Provider[] = [
  {
    provide: LIVEKIT_ROOM_CLIENT,
    useFactory: (cfg: LiveKitConfig): RoomServiceClient =>
      new RoomServiceClient(cfg.url, cfg.apiKey, cfg.apiSecret),
    inject: [LiveKitConfig],
  },
  {
    provide: LIVEKIT_SIP_CLIENT,
    useFactory: (cfg: LiveKitConfig): SipClient =>
      new SipClient(cfg.url, cfg.apiKey, cfg.apiSecret),
    inject: [LiveKitConfig],
  },
  {
    provide: LIVEKIT_EGRESS_CLIENT,
    useFactory: (cfg: LiveKitConfig): EgressClient =>
      new EgressClient(cfg.url, cfg.apiKey, cfg.apiSecret),
    inject: [LiveKitConfig],
  },
  {
    provide: LIVEKIT_INGRESS_CLIENT,
    useFactory: (cfg: LiveKitConfig): IngressClient =>
      new IngressClient(cfg.url, cfg.apiKey, cfg.apiSecret),
    inject: [LiveKitConfig],
  },
  {
    provide: LIVEKIT_AGENT_DISPATCH_CLIENT,
    useFactory: (cfg: LiveKitConfig): AgentDispatchClient =>
      new AgentDispatchClient(cfg.url, cfg.apiKey, cfg.apiSecret),
    inject: [LiveKitConfig],
  },
];
