import { AudioTrack, BarVisualizer } from '@livekit/components-react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { Box } from '@mui/material';
import { OVERLAY_STATES } from './configs';
import { OverlayText, StyledProgress, VisualizerOverlay, VisualizerRoot } from './styled';
import type { AgentVisualizerPanelProps } from './types';

export const AgentVisualizerPanel = ({ agentState, audioTrack }: AgentVisualizerPanelProps) => {
  const showOverlay = OVERLAY_STATES.has(agentState);
  const isSpeaking = agentState === 'speaking';

  return (
    <VisualizerRoot data-lk-theme="default" isSpeaking={isSpeaking}>
      <Box
        component="div"
        style={{
          ['--lk-va-bar-width' as string]: '6px',
          ['--lk-va-bar-gap' as string]: '10px',
          ['--lk-va-bar-border-radius' as string]: '4px',
          ['--lk-fg' as string]: '#1f8cf9',
          ['--lk-va-bar-bg' as string]: 'rgba(255,255,255,0.08)',
          display: 'contents',
        }}
      >
        {audioTrack !== undefined && (
          <AudioTrack
            trackRef={
              audioTrack as Parameters<typeof AudioTrack>[0]['trackRef'] &
                TrackReferenceOrPlaceholder
            }
          />
        )}
        <BarVisualizer
          state={agentState}
          {...(audioTrack !== undefined ? { trackRef: audioTrack } : {})}
          barCount={28}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
      {showOverlay && (
        <VisualizerOverlay>
          <StyledProgress size={32} />
          <OverlayText variant="caption">
            {agentState === 'thinking' ? 'Agent is thinking…' : 'Connecting…'}
          </OverlayText>
        </VisualizerOverlay>
      )}
    </VisualizerRoot>
  );
};
