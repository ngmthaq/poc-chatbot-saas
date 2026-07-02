import { RoomServiceClient } from 'livekit-server-sdk';
import type { CreateOptions, Room } from 'livekit-server-sdk';
import { loadEnv } from '../configs';

export class LiveKitRoomUtil {
  private readonly config = loadEnv();
  private readonly roomService = new RoomServiceClient(
    this.config.LIVEKIT_URL,
    this.config.LIVEKIT_API_KEY,
    this.config.LIVEKIT_API_SECRET,
  );

  /**
   * Creates a new LiveKit room with the supplied options.
   */
  public createRoom(opts: CreateOptions): Promise<Room> {
    return this.roomService.createRoom(opts);
  }

  /**
   * Lists active rooms; when names is omitted returns all rooms.
   */
  public listRooms(names?: string[]): Promise<Room[]> {
    return this.roomService.listRooms(names);
  }

  /**
   * Returns a single room by name, or null when no such room is active.
   */
  public async getRoom(name: string): Promise<Room | null> {
    const result = await this.listRooms([name]);
    return result[0] ?? null;
  }

  /**
   * Deletes the room and disconnects all participants.
   */
  public deleteRoom(name: string): Promise<void> {
    return this.roomService.deleteRoom(name);
  }

  /**
   * Updates the room's metadata field.
   */
  public updateRoomMetadata(name: string, metadata: string): Promise<Room> {
    return this.roomService.updateRoomMetadata(name, metadata);
  }
}

export const liveKitRoomUtil = new LiveKitRoomUtil();
