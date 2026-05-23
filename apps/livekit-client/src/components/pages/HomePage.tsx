import { roomService } from '@/services';
import { roomSessionAtom } from '@/stores';
import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { JoinRoomForm } from '../molecules';
import { MainTemplate } from '../templates';
import { ConferenceRoom } from './ConferenceRoom';

export function HomePage() {
  const [roomSession, setRoomSession] = useAtom(roomSessionAtom);

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ identity, name }: { identity: string; name?: string }) =>
      roomService.join(identity, name),
    onSuccess: (data) => setRoomSession(data),
  });

  if (roomSession !== null) {
    return <ConferenceRoom roomSession={roomSession} onDisconnected={() => setRoomSession(null)} />;
  }

  return (
    <MainTemplate title="Join Room">
      <JoinRoomForm
        onJoin={(identity, name) => mutate({ identity, ...(name !== undefined ? { name } : {}) })}
        isPending={isPending}
        error={error}
      />
    </MainTemplate>
  );
}
