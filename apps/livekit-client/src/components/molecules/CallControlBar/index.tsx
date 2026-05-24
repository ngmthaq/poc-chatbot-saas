import { DisconnectButton, StartAudio, VoiceAssistantControlBar } from '@livekit/components-react';
import { ControlBarRoot } from './styled';

export const CallControlBar = () => {
  return (
    <ControlBarRoot data-lk-theme="default">
      <StartAudio label="Enable Audio" />
      <VoiceAssistantControlBar
        style={{ borderTop: 'none' }}
        controls={{ microphone: true, leave: false }}
      />
      <DisconnectButton>Leave</DisconnectButton>
    </ControlBarRoot>
  );
};
