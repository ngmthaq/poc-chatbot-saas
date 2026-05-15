import { InternalServerErrorException } from '@nestjs/common';

import { LiveKitIngressService } from './livekit-ingress.service';

import type {
  CreateIngressOptions,
  IngressClient,
  IngressInfo,
} from 'livekit-server-sdk';

type IngressClientMock = jest.Mocked<
  Pick<IngressClient, 'createIngress' | 'listIngress' | 'deleteIngress'>
>;

const buildIngressClient = (): IngressClientMock => ({
  createIngress: jest.fn(),
  listIngress: jest.fn(),
  deleteIngress: jest.fn(),
});

const buildService = () => {
  const client = buildIngressClient();
  const service = new LiveKitIngressService(client as unknown as IngressClient);
  jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
  jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  return { service, client };
};

describe('LiveKitIngressService', () => {
  describe('createIngress', () => {
    it('delegates to IngressClient.createIngress with the input type and options', async () => {
      // Arrange
      const { service, client } = buildService();
      const info = { ingressId: 'IN_1' } as unknown as IngressInfo;
      const options = {
        name: 'rtmp-1',
        roomName: 'room-1',
        participantIdentity: 'caller:u1',
      } as unknown as CreateIngressOptions;
      client.createIngress.mockResolvedValue(info);

      // Act
      const result = await service.createIngress({
        inputType: 0,
        options,
      });

      // Assert
      expect(client.createIngress).toHaveBeenCalledWith(0, options);
      expect(result).toBe(info);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.createIngress.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.createIngress({
          inputType: 0,
          options: {} as unknown as CreateIngressOptions,
        }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('listIngress', () => {
    it('passes a roomName filter to IngressClient.listIngress when supplied', async () => {
      // Arrange
      const { service, client } = buildService();
      const infos = [{ ingressId: 'IN_1' }] as unknown as IngressInfo[];
      client.listIngress.mockResolvedValue(infos);

      // Act
      const result = await service.listIngress('room-1');

      // Assert
      expect(client.listIngress).toHaveBeenCalledWith({ roomName: 'room-1' });
      expect(result).toBe(infos);
    });

    it('calls IngressClient.listIngress with undefined when no roomName is provided', async () => {
      // Arrange
      const { service, client } = buildService();
      client.listIngress.mockResolvedValue([]);

      // Act
      await service.listIngress();

      // Assert
      expect(client.listIngress).toHaveBeenCalledWith(undefined);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.listIngress.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.listIngress()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteIngress', () => {
    it('delegates to IngressClient.deleteIngress and returns its result', async () => {
      // Arrange
      const { service, client } = buildService();
      const info = { ingressId: 'IN_1' } as unknown as IngressInfo;
      client.deleteIngress.mockResolvedValue(info);

      // Act
      const result = await service.deleteIngress('IN_1');

      // Assert
      expect(client.deleteIngress).toHaveBeenCalledWith('IN_1');
      expect(result).toBe(info);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.deleteIngress.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.deleteIngress('IN_1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
