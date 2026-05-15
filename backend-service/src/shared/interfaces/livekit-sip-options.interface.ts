export interface LiveKitCreateSipParticipantOptions {
  trunkId?: string;
  sipCallTo: string;
  roomName: string;
  participantIdentity: string;
  participantName?: string;
  krispEnabled?: boolean;
}
