import { AgentInfoCard } from '@/components/molecules/AgentInfoCard';
import { AgentVisualizerPanel } from '@/components/molecules/AgentVisualizerPanel';
import { CallControlBar } from '@/components/molecules/CallControlBar';
import { TranscriptionFeed } from '@/components/molecules/TranscriptionFeed';
import { VoiceTranscriptionBridge } from '@/components/molecules/VoiceTranscriptionBridge';
import { useChatMode } from '@/hooks/stores';
import {
  RoomAudioRenderer,
  useLocalParticipant,
  useTranscriptions,
  useVoiceAssistant,
} from '@livekit/components-react';
import type { FC } from 'react';
import { CONNECTION_STATE_COLORS, CONNECTION_STATE_LABELS } from './configs';
import {
  ColumnBox,
  ErrorIcon,
  FailureOverlay,
  FailureReasonList,
  FailureReasonText,
  FinishedOverlay,
  OverlayTitle,
  PendingOverlay,
  PendingSpinner,
  PendingText,
  ReconnectButton,
  StatusChip,
  SuccessIcon,
  TryAgainButton,
  VoiceFooter,
  VoiceMain,
  VoiceRoot,
} from './styled';
import { useAgentCallState } from './useAgentCallState';

export const VoiceSession: FC = () => {
  const [, setMode] = useChatMode();
  const { audioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const transcriptions = useTranscriptions();
  const {
    agent,
    connectionState,
    isPending,
    hasFailure,
    isFinishedClean,
    handleReconnect,
  } = useAgentCallState();

  return (
    <VoiceRoot data-lk-theme="default">
      <RoomAudioRenderer />
      <VoiceTranscriptionBridge />
      <StatusChip
        label={CONNECTION_STATE_LABELS[connectionState]}
        color={CONNECTION_STATE_COLORS[connectionState]}
        size="small"
      />
      <VoiceMain>
        <ColumnBox>
          <AgentVisualizerPanel
            agentState={agent.state}
            {...(audioTrack !== undefined && audioTrack !== null
              ? { audioTrack }
              : {})}
          />
          {agent.canListen && (
            <AgentInfoCard
              state={agent.state}
              identity={agent.identity}
              name={agent.name}
              metadata={agent.metadata}
              participant={localParticipant}
              microphoneTrack={agent.microphoneTrack}
            />
          )}
          {(agent.canListen || transcriptions.length > 0) && (
            <TranscriptionFeed transcriptions={transcriptions} />
          )}
        </ColumnBox>
      </VoiceMain>
      <VoiceFooter>
        <CallControlBar onLeave={() => setMode('text')} />
      </VoiceFooter>
      {isPending && !agent.canListen && (
        <PendingOverlay>
          <PendingSpinner size={40} />
          <PendingText variant="body2">Connecting to agent…</PendingText>
        </PendingOverlay>
      )}
      {isFinishedClean && (
        <FinishedOverlay>
          <SuccessIcon />
          <OverlayTitle variant="h6">Call ended</OverlayTitle>
          <ReconnectButton variant="contained" onClick={handleReconnect}>
            Start New Call
          </ReconnectButton>
        </FinishedOverlay>
      )}
      {!isFinishedClean && hasFailure && (
        <FailureOverlay>
          <ErrorIcon />
          <OverlayTitle variant="h6">Connection failed</OverlayTitle>
          {agent.isFinished && agent.failureReasons !== null && (
            <FailureReasonList>
              {agent.failureReasons.map((reason, i) => (
                <FailureReasonText key={i} variant="body2">
                  {reason}
                </FailureReasonText>
              ))}
            </FailureReasonList>
          )}
          <TryAgainButton variant="contained" onClick={handleReconnect}>
            Try Again
          </TryAgainButton>
        </FailureOverlay>
      )}
    </VoiceRoot>
  );
};
