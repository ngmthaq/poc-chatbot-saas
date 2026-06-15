import { ModeToggle } from '@/components/atoms';
import { ChatView, VoiceSession } from '@/components/molecules';
import { LiveKitSessionProvider } from '@/components/providers';
import { useChatMode } from '@/hooks/stores';
import type { FC } from 'react';
import {
  BrandIcon,
  HeaderStack,
  RoomTitle,
  ShellBody,
  ShellHeader,
  ShellRoot,
} from './styled';

export const HomePage: FC = () => {
  const [mode] = useChatMode();

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
        {mode === 'text' ? (
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
