import type {
  AgentState,
  TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import type { Participant } from 'livekit-client';

export interface AgentInfoCardProps {
  state: AgentState;
  identity: string;
  name: string | null | undefined;
  metadata: string | null | undefined;
  participant: Participant;
  microphoneTrack: TrackReferenceOrPlaceholder | undefined;
}
