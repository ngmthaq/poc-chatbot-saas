import { InternalServerErrorException } from '@nestjs/common';

import { LiveKitRoomService } from './livekit-room.service';

import type {
  ParticipantInfo,
  Room,
  RoomServiceClient,
  TrackInfo,
} from 'livekit-server-sdk';

type RoomClientMock = jest.Mocked<
  Pick<
    RoomServiceClient,
    | 'createRoom'
    | 'listRooms'
    | 'deleteRoom'
    | 'listParticipants'
    | 'getParticipant'
    | 'removeParticipant'
    | 'updateParticipant'
    | 'mutePublishedTrack'
  >
>;

const buildRoomClient = (): RoomClientMock => ({
  createRoom: jest.fn(),
  listRooms: jest.fn(),
  deleteRoom: jest.fn(),
  listParticipants: jest.fn(),
  getParticipant: jest.fn(),
  removeParticipant: jest.fn(),
  updateParticipant: jest.fn(),
  mutePublishedTrack: jest.fn(),
});

describe('LiveKitRoomService', () => {
  let client: RoomClientMock;
  let service: LiveKitRoomService;

  beforeEach(() => {
    client = buildRoomClient();
    service = new LiveKitRoomService(client as unknown as RoomServiceClient);
    jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  });

  describe('createRoom', () => {
    it('delegates to RoomServiceClient.createRoom and returns its result', async () => {
      // Arrange
      const room = { sid: 'RM_1', name: 'room-1' } as unknown as Room;
      client.createRoom.mockResolvedValue(room);

      // Act
      const result = await service.createRoom({ name: 'room-1' });

      // Assert
      expect(client.createRoom).toHaveBeenCalledWith({ name: 'room-1' });
      expect(result).toBe(room);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      client.createRoom.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.createRoom({ name: 'room-1' }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('listRooms', () => {
    it('forwards the names filter and returns the rooms', async () => {
      // Arrange
      const rooms = [{ name: 'room-1' }] as unknown as Room[];
      client.listRooms.mockResolvedValue(rooms);

      // Act
      const result = await service.listRooms(['room-1']);

      // Assert
      expect(client.listRooms).toHaveBeenCalledWith(['room-1']);
      expect(result).toBe(rooms);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      client.listRooms.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.listRooms()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteRoom', () => {
    it('delegates to RoomServiceClient.deleteRoom', async () => {
      // Arrange
      client.deleteRoom.mockResolvedValue(undefined);

      // Act
      await service.deleteRoom('room-1');

      // Assert
      expect(client.deleteRoom).toHaveBeenCalledWith('room-1');
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      client.deleteRoom.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.deleteRoom('room-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('listParticipants', () => {
    it('delegates to RoomServiceClient.listParticipants', async () => {
      // Arrange
      const participants = [
        { identity: 'caller:u1' },
      ] as unknown as ParticipantInfo[];
      client.listParticipants.mockResolvedValue(participants);

      // Act
      const result = await service.listParticipants('room-1');

      // Assert
      expect(client.listParticipants).toHaveBeenCalledWith('room-1');
      expect(result).toBe(participants);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      client.listParticipants.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.listParticipants('room-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('getParticipant', () => {
    it('delegates to RoomServiceClient.getParticipant', async () => {
      // Arrange
      const participant = {
        identity: 'caller:u1',
      } as unknown as ParticipantInfo;
      client.getParticipant.mockResolvedValue(participant);

      // Act
      const result = await service.getParticipant('room-1', 'caller:u1');

      // Assert
      expect(client.getParticipant).toHaveBeenCalledWith('room-1', 'caller:u1');
      expect(result).toBe(participant);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      client.getParticipant.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.getParticipant('room-1', 'caller:u1'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('removeParticipant', () => {
    it('delegates to RoomServiceClient.removeParticipant', async () => {
      // Arrange
      client.removeParticipant.mockResolvedValue(undefined);

      // Act
      await service.removeParticipant('room-1', 'caller:u1');

      // Assert
      expect(client.removeParticipant).toHaveBeenCalledWith(
        'room-1',
        'caller:u1',
      );
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      client.removeParticipant.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.removeParticipant('room-1', 'caller:u1'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('updateParticipant', () => {
    it('delegates to RoomServiceClient.updateParticipant with the given options', async () => {
      // Arrange
      const updated = { identity: 'caller:u1' } as unknown as ParticipantInfo;
      client.updateParticipant.mockResolvedValue(updated);
      const opts = { metadata: 'm' };

      // Act
      const result = await service.updateParticipant(
        'room-1',
        'caller:u1',
        opts,
      );

      // Assert
      expect(client.updateParticipant).toHaveBeenCalledWith(
        'room-1',
        'caller:u1',
        opts,
      );
      expect(result).toBe(updated);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      client.updateParticipant.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.updateParticipant('room-1', 'caller:u1', {}),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('mutePublishedTrack', () => {
    it('delegates to RoomServiceClient.mutePublishedTrack with all args', async () => {
      // Arrange
      const track = { sid: 'TR_1' } as unknown as TrackInfo;
      client.mutePublishedTrack.mockResolvedValue(track);

      // Act
      const result = await service.mutePublishedTrack(
        'room-1',
        'caller:u1',
        'TR_1',
        true,
      );

      // Assert
      expect(client.mutePublishedTrack).toHaveBeenCalledWith(
        'room-1',
        'caller:u1',
        'TR_1',
        true,
      );
      expect(result).toBe(track);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      client.mutePublishedTrack.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.mutePublishedTrack('room-1', 'caller:u1', 'TR_1', true),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
