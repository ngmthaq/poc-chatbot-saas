import { InternalServerErrorException } from '@nestjs/common';

import { LiveKitEgressService } from './livekit-egress.service';

import type {
  EgressClient,
  EgressInfo,
  EncodedFileOutput,
} from 'livekit-server-sdk';

type EgressClientMock = jest.Mocked<
  Pick<EgressClient, 'startRoomCompositeEgress' | 'stopEgress' | 'listEgress'>
>;

const buildEgressClient = (): EgressClientMock => ({
  startRoomCompositeEgress: jest.fn(),
  stopEgress: jest.fn(),
  listEgress: jest.fn(),
});

const buildService = () => {
  const client = buildEgressClient();
  const service = new LiveKitEgressService(client as unknown as EgressClient);
  jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
  jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  return { service, client };
};

describe('LiveKitEgressService', () => {
  describe('startRoomCompositeEgress', () => {
    it('delegates to EgressClient.startRoomCompositeEgress with the room, output and options', async () => {
      // Arrange
      const { service, client } = buildService();
      const info = { egressId: 'EG_1' } as unknown as EgressInfo;
      const output = {
        filepath: '/tmp/out.mp4',
      } as unknown as EncodedFileOutput;
      const options = { layout: 'speaker' };
      client.startRoomCompositeEgress.mockResolvedValue(info);

      // Act
      const result = await service.startRoomCompositeEgress({
        roomName: 'room-1',
        output,
        options,
      });

      // Assert
      expect(client.startRoomCompositeEgress).toHaveBeenCalledWith(
        'room-1',
        output,
        options,
      );
      expect(result).toBe(info);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      const output = {} as unknown as EncodedFileOutput;
      client.startRoomCompositeEgress.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.startRoomCompositeEgress({ roomName: 'room-1', output }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('stopEgress', () => {
    it('delegates to EgressClient.stopEgress and returns its result', async () => {
      // Arrange
      const { service, client } = buildService();
      const info = { egressId: 'EG_1' } as unknown as EgressInfo;
      client.stopEgress.mockResolvedValue(info);

      // Act
      const result = await service.stopEgress('EG_1');

      // Assert
      expect(client.stopEgress).toHaveBeenCalledWith('EG_1');
      expect(result).toBe(info);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.stopEgress.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.stopEgress('EG_1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('listEgress', () => {
    it('passes a roomName filter to EgressClient.listEgress when supplied', async () => {
      // Arrange
      const { service, client } = buildService();
      const infos = [{ egressId: 'EG_1' }] as unknown as EgressInfo[];
      client.listEgress.mockResolvedValue(infos);

      // Act
      const result = await service.listEgress('room-1');

      // Assert
      expect(client.listEgress).toHaveBeenCalledWith({ roomName: 'room-1' });
      expect(result).toBe(infos);
    });

    it('calls EgressClient.listEgress with undefined when no roomName is provided', async () => {
      // Arrange
      const { service, client } = buildService();
      client.listEgress.mockResolvedValue([]);

      // Act
      await service.listEgress();

      // Assert
      expect(client.listEgress).toHaveBeenCalledWith(undefined);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.listEgress.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.listEgress()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
