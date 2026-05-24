import {
  AgentInfoCard,
  AgentVisualizerPanel,
  CallControlBar,
  TranscriptionFeed,
} from '@/components/molecules';
import {
  RoomAudioRenderer,
  useAgent,
  useConnectionState,
  useLocalParticipant,
  useRoomInfo,
  useTranscriptions,
  useVoiceAssistant,
} from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { useMemo } from 'react';
import { CONNECTION_STATE_COLORS, CONNECTION_STATE_LABELS } from './configs';
import {
  BrandIcon,
  ColumnBox,
  ErrorIcon,
  FailureOverlay,
  FailureReasonList,
  FailureReasonText,
  FinishedOverlay,
  HeaderStack,
  OverlayTitle,
  PageFooter,
  PageHeader,
  PageMain,
  PageRoot,
  PendingOverlay,
  PendingSpinner,
  PendingText,
  ReconnectButton,
  RoomTitle,
  StatusChip,
  SuccessIcon,
  TryAgainButton,
} from './styled';

export const HomePage = () => {
  const agent = useAgent();
  const { audioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const { name: roomName } = useRoomInfo();
  const transcriptions = useTranscriptions();

  const isPending = useMemo(() => {
    return agent.isPending || connectionState === ConnectionState.Connecting;
  }, [agent.isPending, connectionState]);

  const hasFailure = useMemo(() => {
    return agent.isFinished && agent.failureReasons !== null && agent.failureReasons.length > 0;
  }, [agent.isFinished, agent.failureReasons]);

  const isFinishedClean = useMemo(() => {
    return agent.isFinished && (agent.failureReasons === null || agent.failureReasons.length === 0);
  }, [agent.isFinished, agent.failureReasons]);

  const handleReconnect = () => {
    window.location.reload();
  };

  return (
    <PageRoot data-lk-theme="default">
      <RoomAudioRenderer />
      <PageHeader>
        <HeaderStack direction="row" alignItems="center" spacing={1.25}>
          <BrandIcon />
          <RoomTitle variant="subtitle1">{roomName || 'Call Center Agent'}</RoomTitle>
        </HeaderStack>
        <StatusChip
          label={CONNECTION_STATE_LABELS[connectionState]}
          color={CONNECTION_STATE_COLORS[connectionState]}
          size="small"
        />
      </PageHeader>
      <PageMain>
        <ColumnBox>
          <AgentVisualizerPanel
            agentState={agent.state}
            {...(audioTrack !== undefined && audioTrack !== null ? { audioTrack } : {})}
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
      </PageMain>
      <PageFooter>
        <CallControlBar />
      </PageFooter>
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
    </PageRoot>
  );
};
