import { randomUUID } from 'node:crypto';
import { livekitRoomUtil } from '../utils/livekit-room';
import { livekitTokenUtil } from '../utils/livekit-token';
import type { JoinRoomBody } from '../validators/room.validator';

export class RoomService {
  public async join(body: JoinRoomBody): Promise<{ roomName: string; token: string }> {
    const roomName = 'room-' + randomUUID();
    await livekitRoomUtil.createRoom({ name: roomName });
    const token = await livekitTokenUtil.createAccessToken({
      roomName,
      identity: body.identity,
      ...(body.name !== undefined ? { name: body.name } : {}),
    });
    return { roomName, token };
  }
}

export const roomService = new RoomService();
