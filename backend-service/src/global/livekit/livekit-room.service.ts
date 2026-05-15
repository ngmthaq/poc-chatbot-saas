import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  CreateOptions,
  ParticipantInfo,
  Room,
  RoomServiceClient,
  TrackInfo,
  UpdateParticipantOptions,
} from 'livekit-server-sdk';

import { LIVEKIT_ROOM_CLIENT } from './livekit.tokens';

@Injectable()
export class LiveKitRoomService {
  private readonly logger = new Logger(LiveKitRoomService.name);

  constructor(
    @Inject(LIVEKIT_ROOM_CLIENT)
    private readonly client: RoomServiceClient,
  ) {}

  async createRoom(options: CreateOptions): Promise<Room> {
    const ctx = { roomName: options.name };
    try {
      const room = await this.client.createRoom(options);
      this.logger.log(
        `createRoom ok ${JSON.stringify({ ...ctx, sid: room.sid })}`,
      );
      return room;
    } catch (err) {
      this.logger.error(
        `createRoom failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit createRoom failed');
    }
  }

  async listRooms(names?: string[]): Promise<Room[]> {
    const ctx = { roomNames: names };
    try {
      const rooms = await this.client.listRooms(names);
      this.logger.log(
        `listRooms ok ${JSON.stringify({ ...ctx, count: rooms.length })}`,
      );
      return rooms;
    } catch (err) {
      this.logger.error(
        `listRooms failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit listRooms failed');
    }
  }

  async deleteRoom(name: string): Promise<void> {
    const ctx = { roomName: name };
    try {
      await this.client.deleteRoom(name);
      this.logger.log(`deleteRoom ok ${JSON.stringify(ctx)}`);
    } catch (err) {
      this.logger.error(
        `deleteRoom failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit deleteRoom failed');
    }
  }

  async listParticipants(room: string): Promise<ParticipantInfo[]> {
    const ctx = { roomName: room };
    try {
      const participants = await this.client.listParticipants(room);
      this.logger.log(
        `listParticipants ok ${JSON.stringify({ ...ctx, count: participants.length })}`,
      );
      return participants;
    } catch (err) {
      this.logger.error(
        `listParticipants failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit listParticipants failed');
    }
  }

  async getParticipant(
    room: string,
    identity: string,
  ): Promise<ParticipantInfo> {
    const ctx = { roomName: room, identity };
    try {
      const participant = await this.client.getParticipant(room, identity);
      this.logger.log(`getParticipant ok ${JSON.stringify(ctx)}`);
      return participant;
    } catch (err) {
      this.logger.error(
        `getParticipant failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit getParticipant failed');
    }
  }

  async removeParticipant(room: string, identity: string): Promise<void> {
    const ctx = { roomName: room, identity };
    try {
      await this.client.removeParticipant(room, identity);
      this.logger.log(`removeParticipant ok ${JSON.stringify(ctx)}`);
    } catch (err) {
      this.logger.error(
        `removeParticipant failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit removeParticipant failed',
      );
    }
  }

  async updateParticipant(
    room: string,
    identity: string,
    options: UpdateParticipantOptions,
  ): Promise<ParticipantInfo> {
    const ctx = { roomName: room, identity };
    try {
      const participant = await this.client.updateParticipant(
        room,
        identity,
        options,
      );
      this.logger.log(`updateParticipant ok ${JSON.stringify(ctx)}`);
      return participant;
    } catch (err) {
      this.logger.error(
        `updateParticipant failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit updateParticipant failed',
      );
    }
  }

  async mutePublishedTrack(
    room: string,
    identity: string,
    trackSid: string,
    muted: boolean,
  ): Promise<TrackInfo> {
    const ctx = { roomName: room, identity, trackSid, muted };
    try {
      const track = await this.client.mutePublishedTrack(
        room,
        identity,
        trackSid,
        muted,
      );
      this.logger.log(`mutePublishedTrack ok ${JSON.stringify(ctx)}`);
      return track;
    } catch (err) {
      this.logger.error(
        `mutePublishedTrack failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit mutePublishedTrack failed',
      );
    }
  }
}
