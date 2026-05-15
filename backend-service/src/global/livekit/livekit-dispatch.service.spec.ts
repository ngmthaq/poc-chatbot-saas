import { InternalServerErrorException } from '@nestjs/common';

import { LiveKitDispatchService } from './livekit-dispatch.service';
import { LiveKitConfig } from './livekit.config';

import type { AgentDispatch } from '@livekit/protocol';
import type { AgentDispatchClient } from 'livekit-server-sdk';

type DispatchClientMock = jest.Mocked<
  Pick<
    AgentDispatchClient,
    'createDispatch' | 'listDispatch' | 'getDispatch' | 'deleteDispatch'
  >
>;

const buildDispatchClient = (): DispatchClientMock => ({
  createDispatch: jest.fn(),
  listDispatch: jest.fn(),
  getDispatch: jest.fn(),
  deleteDispatch: jest.fn(),
});

const buildConfig = (agentName: string): LiveKitConfig => ({
  url: 'wss://example',
  apiKey: 'k',
  apiSecret: 's',
  webhookPath: 'livekit/webhook',
  defaultTokenTtlSeconds: 3600,
  sipTrunkId: undefined,
  agentName,
});

const buildService = (agentName = 'cfg-agent') => {
  const client = buildDispatchClient();
  const config = buildConfig(agentName);
  const service = new LiveKitDispatchService(
    client as unknown as AgentDispatchClient,
    config,
  );
  jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
  jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  return { service, client, config };
};

describe('LiveKitDispatchService', () => {
  describe('createDispatch', () => {
    it('uses the caller-supplied agentName and forwards metadata when provided', async () => {
      // Arrange
      const { service, client } = buildService('cfg-agent');
      const dispatch = { id: 'AD_1' } as unknown as AgentDispatch;
      client.createDispatch.mockResolvedValue(dispatch);

      // Act
      const result = await service.createDispatch(
        'room-1',
        'caller-agent',
        '{"hint":"x"}',
      );

      // Assert
      expect(client.createDispatch).toHaveBeenCalledWith(
        'room-1',
        'caller-agent',
        { metadata: '{"hint":"x"}' },
      );
      expect(result).toBe(dispatch);
    });

    it('falls back to LiveKitConfig.agentName when caller omits agentName', async () => {
      // Arrange
      const { service, client } = buildService('cfg-agent');
      const dispatch = { id: 'AD_2' } as unknown as AgentDispatch;
      client.createDispatch.mockResolvedValue(dispatch);

      // Act
      await service.createDispatch('room-1');

      // Assert
      expect(client.createDispatch).toHaveBeenCalledWith(
        'room-1',
        'cfg-agent',
        undefined,
      );
    });

    it('passes undefined options when metadata is omitted', async () => {
      // Arrange
      const { service, client } = buildService('cfg-agent');
      client.createDispatch.mockResolvedValue({
        id: 'AD_3',
      } as unknown as AgentDispatch);

      // Act
      await service.createDispatch('room-1', 'caller-agent');

      // Assert
      expect(client.createDispatch).toHaveBeenCalledWith(
        'room-1',
        'caller-agent',
        undefined,
      );
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.createDispatch.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.createDispatch('room-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('listDispatch', () => {
    it('delegates to AgentDispatchClient.listDispatch with the roomName', async () => {
      // Arrange
      const { service, client } = buildService();
      const dispatches = [{ id: 'AD_1' }] as unknown as AgentDispatch[];
      client.listDispatch.mockResolvedValue(dispatches);

      // Act
      const result = await service.listDispatch('room-1');

      // Assert
      expect(client.listDispatch).toHaveBeenCalledWith('room-1');
      expect(result).toBe(dispatches);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.listDispatch.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.listDispatch('room-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('getDispatch', () => {
    it('delegates to AgentDispatchClient.getDispatch with both ids', async () => {
      // Arrange
      const { service, client } = buildService();
      const dispatch = { id: 'AD_1' } as unknown as AgentDispatch;
      client.getDispatch.mockResolvedValue(dispatch);

      // Act
      const result = await service.getDispatch('AD_1', 'room-1');

      // Assert
      expect(client.getDispatch).toHaveBeenCalledWith('AD_1', 'room-1');
      expect(result).toBe(dispatch);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.getDispatch.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.getDispatch('AD_1', 'room-1'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('deleteDispatch', () => {
    it('delegates to AgentDispatchClient.deleteDispatch with both ids', async () => {
      // Arrange
      const { service, client } = buildService();
      client.deleteDispatch.mockResolvedValue(undefined);

      // Act
      await service.deleteDispatch('AD_1', 'room-1');

      // Assert
      expect(client.deleteDispatch).toHaveBeenCalledWith('AD_1', 'room-1');
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.deleteDispatch.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.deleteDispatch('AD_1', 'room-1'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
