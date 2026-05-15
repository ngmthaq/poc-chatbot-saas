import { LIVEKIT_WEBHOOK_EVENT_NAMES } from '../constants/livekit.constants';

import type {
  EgressInfo,
  IngressInfo,
  ParticipantInfo,
  Room,
} from 'livekit-server-sdk';

export type LiveKitWebhookEventName =
  (typeof LIVEKIT_WEBHOOK_EVENT_NAMES)[number];

export interface LiveKitWebhookEventPayload<
  TName extends LiveKitWebhookEventName,
> {
  event: TName;
  room?: Room;
  participant?: ParticipantInfo;
  egressInfo?: EgressInfo;
  ingressInfo?: IngressInfo;
  id: string;
  createdAt: number;
}
