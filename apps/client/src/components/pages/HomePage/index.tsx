import { ModeToggle } from '@/components/atoms';
import { ChatView, VoiceSession } from '@/components/molecules';
import { LiveKitSessionProvider } from '@/components/providers';
import { usePublicConfig } from '@/hooks/queries';
import { useChatMode } from '@/hooks/stores';
import type { FC } from 'react';
import { useEffect } from 'react';
import {
  BrandIcon,
  HeaderStack,
  RoomTitle,
  ShellBody,
  ShellHeader,
  ShellRoot,
} from './styled';

export const HomePage: FC = () => {
  const [mode, setMode] = useChatMode();
  const { voiceModeEnabled } = usePublicConfig();

  // Force text mode whenever voice is unavailable, regardless of stored mode.
  const effectiveMode = voiceModeEnabled ? mode : 'text';

  // Reconcile the persisted mode so the rest of the app never sees 'voice'.
  useEffect(() => {
    if (!voiceModeEnabled && mode === 'voice') {
      setMode('text');
    }
  }, [voiceModeEnabled, mode, setMode]);

  return (
    <ShellRoot>
      <ShellHeader>
        <HeaderStack direction="row" alignItems="center" spacing={1.25}>
          <BrandIcon />
          <RoomTitle variant="subtitle1">Call Center Agent</RoomTitle>
        </HeaderStack>
        <ModeToggle />
      </ShellHeader>
      <ShellBody>
        {effectiveMode === 'text' ? (
          <ChatView />
        ) : (
          <LiveKitSessionProvider>
            <VoiceSession />
          </LiveKitSessionProvider>
        )}
      </ShellBody>
    </ShellRoot>
  );
};
