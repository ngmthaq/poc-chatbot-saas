export const LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS = 3600;

export const LIVEKIT_EVENT_PREFIX = 'livekit' as const;

export const LIVEKIT_WEBHOOK_ROUTE = 'livekit/webhook' as const;

export const LIVEKIT_WEBHOOK_EVENT_NAMES = [
  'room_started',
  'room_finished',
  'participant_joined',
  'participant_left',
  'participant_connection_aborted',
  'track_published',
  'track_unpublished',
  'egress_started',
  'egress_updated',
  'egress_ended',
  'ingress_started',
  'ingress_ended',
] as const;

export const LIVEKIT_CALLER_IDENTITY_PREFIX = 'caller:' as const;
export const LIVEKIT_AGENT_IDENTITY_PREFIX = 'agent:' as const;
export const LIVEKIT_SUPERVISOR_IDENTITY_PREFIX = 'supervisor:' as const;
