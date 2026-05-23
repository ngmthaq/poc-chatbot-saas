import { randomUUID } from 'node:crypto';
import { LiveKitRoomUtil } from '../utils/livekit-room';
import { LiveKitTokenUtil } from '../utils/livekit-token';
import type { JoinRoomBody } from '../validators/room.validator';

export class RoomService {
  private readonly liveKitRoomUtil = new LiveKitRoomUtil();
  private readonly liveKitTokenUtil = new LiveKitTokenUtil();

  public async join(body: JoinRoomBody): Promise<{ roomName: string; token: string }> {
    const roomName = 'room-' + randomUUID();
    await this.liveKitRoomUtil.createRoom({ name: roomName });
    const token = await this.liveKitTokenUtil.createAccessToken({
      roomName,
      identity: body.identity,
      ...(body.name !== undefined ? { name: body.name } : {}),
    });
    return { roomName, token };
  }
}
