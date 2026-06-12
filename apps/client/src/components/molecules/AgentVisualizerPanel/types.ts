import type {
  AgentState,
  TrackReferenceOrPlaceholder,
} from '@livekit/components-react';

export interface AgentVisualizerPanelProps {
  agentState: AgentState;
  audioTrack?: TrackReferenceOrPlaceholder;
}

export interface VisualizerRootProps {
  isSpeaking: boolean;
}
