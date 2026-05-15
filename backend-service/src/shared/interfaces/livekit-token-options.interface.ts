export interface LiveKitVideoGrantOptions {
  roomCreate?: boolean;
  roomJoin?: boolean;
  roomList?: boolean;
  roomRecord?: boolean;
  roomAdmin?: boolean;
  room?: string;
  ingressAdmin?: boolean;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  canUpdateOwnMetadata?: boolean;
  hidden?: boolean;
  recorder?: boolean;
  agent?: boolean;
  canSubscribeMetrics?: boolean;
  canManageAgentSession?: boolean;
  destinationRoom?: string;
}

export interface LiveKitTokenOptions {
  identity: string;
  name?: string;
  roomName: string;
  metadata?: string;
  ttlSeconds?: number;
  grants?: LiveKitVideoGrantOptions;
}

export type LiveKitCallerTokenOptions = Omit<LiveKitTokenOptions, 'grants'>;

export type LiveKitAgentTokenOptions = Omit<LiveKitTokenOptions, 'grants'>;

export interface LiveKitSupervisorTokenOptions extends Omit<
  LiveKitTokenOptions,
  'grants'
> {
  hidden?: boolean;
}
