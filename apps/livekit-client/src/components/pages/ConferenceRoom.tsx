import type { RoomSession } from '@/stores';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';

const LIVEKIT_URL = import.meta.env['VITE_LIVEKIT_URL'];
if (!LIVEKIT_URL) throw new Error('VITE_LIVEKIT_URL is not defined');

type ConferenceRoomProps = {
  roomSession: RoomSession;
  onDisconnected: () => void;
};

export function ConferenceRoom({ roomSession, onDisconnected }: ConferenceRoomProps) {
  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_URL}
      token={roomSession.token}
      connect={true}
      audio={true}
      video={true}
      onDisconnected={onDisconnected}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
