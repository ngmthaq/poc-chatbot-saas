import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { LiveKitSipService } from './livekit-sip.service';
import { LiveKitConfig } from './livekit.config';

import type {
  SIPDispatchRuleInfo,
  SIPInboundTrunkInfo,
  SIPOutboundTrunkInfo,
  SIPParticipantInfo,
  SIPTrunkInfo,
  SipClient,
  SipDispatchRuleDirect,
} from 'livekit-server-sdk';

type SipClientMock = jest.Mocked<
  Pick<
    SipClient,
    | 'createSipInboundTrunk'
    | 'createSipOutboundTrunk'
    | 'listSipInboundTrunk'
    | 'listSipOutboundTrunk'
    | 'deleteSipTrunk'
    | 'createSipDispatchRule'
    | 'listSipDispatchRule'
    | 'deleteSipDispatchRule'
    | 'createSipParticipant'
  >
>;

const buildSipClient = (): SipClientMock =>
  ({
    createSipInboundTrunk: jest.fn(),
    createSipOutboundTrunk: jest.fn(),
    listSipInboundTrunk: jest.fn(),
    listSipOutboundTrunk: jest.fn(),
    deleteSipTrunk: jest.fn(),
    createSipDispatchRule: jest.fn(),
    listSipDispatchRule: jest.fn(),
    deleteSipDispatchRule: jest.fn(),
    createSipParticipant: jest.fn(),
  }) as unknown as SipClientMock;

const buildConfig = (sipTrunkId?: string): LiveKitConfig => ({
  url: 'wss://example',
  apiKey: 'k',
  apiSecret: 's',
  webhookPath: 'livekit/webhook',
  defaultTokenTtlSeconds: 3600,
  sipTrunkId,
  agentName: 'voice-agent',
});

const buildService = (sipTrunkId?: string) => {
  const client = buildSipClient();
  const config = buildConfig(sipTrunkId);
  const service = new LiveKitSipService(client as unknown as SipClient, config);
  jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
  jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  return { service, client, config };
};

describe('LiveKitSipService', () => {
  describe('createSipInboundTrunk', () => {
    it('delegates to SipClient.createSipInboundTrunk and returns its result', async () => {
      // Arrange
      const { service, client } = buildService();
      const trunk = { sipTrunkId: 'ST_1' } as unknown as SIPInboundTrunkInfo;
      client.createSipInboundTrunk.mockResolvedValue(trunk);

      // Act
      const result = await service.createSipInboundTrunk(
        'inbound',
        ['+15550000001'],
        undefined,
      );

      // Assert
      expect(client.createSipInboundTrunk).toHaveBeenCalledWith(
        'inbound',
        ['+15550000001'],
        undefined,
      );
      expect(result).toBe(trunk);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.createSipInboundTrunk.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.createSipInboundTrunk('inbound', ['+15550000001']),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('createSipOutboundTrunk', () => {
    it('delegates to SipClient.createSipOutboundTrunk with all args', async () => {
      // Arrange
      const { service, client } = buildService();
      const trunk = { sipTrunkId: 'ST_2' } as unknown as SIPOutboundTrunkInfo;
      client.createSipOutboundTrunk.mockResolvedValue(trunk);

      // Act
      const result = await service.createSipOutboundTrunk(
        'outbound',
        'sip:carrier.example.com',
        ['+15550000002'],
      );

      // Assert
      expect(client.createSipOutboundTrunk).toHaveBeenCalledWith(
        'outbound',
        'sip:carrier.example.com',
        ['+15550000002'],
        undefined,
      );
      expect(result).toBe(trunk);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.createSipOutboundTrunk.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.createSipOutboundTrunk('outbound', 'sip:c', ['+15550000002']),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('listSipInboundTrunk', () => {
    it('delegates to SipClient.listSipInboundTrunk', async () => {
      // Arrange
      const { service, client } = buildService();
      const trunks = [
        { sipTrunkId: 'ST_1' },
      ] as unknown as SIPInboundTrunkInfo[];
      client.listSipInboundTrunk.mockResolvedValue(trunks);

      // Act
      const result = await service.listSipInboundTrunk();

      // Assert
      expect(client.listSipInboundTrunk).toHaveBeenCalledWith(undefined);
      expect(result).toBe(trunks);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.listSipInboundTrunk.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.listSipInboundTrunk()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('listSipOutboundTrunk', () => {
    it('delegates to SipClient.listSipOutboundTrunk', async () => {
      // Arrange
      const { service, client } = buildService();
      const trunks = [
        { sipTrunkId: 'ST_2' },
      ] as unknown as SIPOutboundTrunkInfo[];
      client.listSipOutboundTrunk.mockResolvedValue(trunks);

      // Act
      const result = await service.listSipOutboundTrunk();

      // Assert
      expect(client.listSipOutboundTrunk).toHaveBeenCalledWith(undefined);
      expect(result).toBe(trunks);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.listSipOutboundTrunk.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.listSipOutboundTrunk()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteSipTrunk', () => {
    it('delegates to SipClient.deleteSipTrunk', async () => {
      // Arrange
      const { service, client } = buildService();
      client.deleteSipTrunk.mockResolvedValue({} as unknown as SIPTrunkInfo);

      // Act
      await service.deleteSipTrunk('ST_1');

      // Assert
      expect(client.deleteSipTrunk).toHaveBeenCalledWith('ST_1');
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.deleteSipTrunk.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.deleteSipTrunk('ST_1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('createSipDispatchRule', () => {
    it('delegates to SipClient.createSipDispatchRule', async () => {
      // Arrange
      const { service, client } = buildService();
      const dispatchRule = {
        sipDispatchRuleId: 'DR_1',
      } as unknown as SIPDispatchRuleInfo;
      client.createSipDispatchRule.mockResolvedValue(dispatchRule);
      const rule = { type: 'direct' } as unknown as SipDispatchRuleDirect;

      // Act
      const result = await service.createSipDispatchRule(rule, { name: 'r1' });

      // Assert
      expect(client.createSipDispatchRule).toHaveBeenCalledWith(rule, {
        name: 'r1',
      });
      expect(result).toBe(dispatchRule);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.createSipDispatchRule.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.createSipDispatchRule({} as unknown as SipDispatchRuleDirect),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('listSipDispatchRule', () => {
    it('delegates to SipClient.listSipDispatchRule', async () => {
      // Arrange
      const { service, client } = buildService();
      const rules = [
        { sipDispatchRuleId: 'DR_1' },
      ] as unknown as SIPDispatchRuleInfo[];
      client.listSipDispatchRule.mockResolvedValue(rules);

      // Act
      const result = await service.listSipDispatchRule();

      // Assert
      expect(client.listSipDispatchRule).toHaveBeenCalledWith(undefined);
      expect(result).toBe(rules);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.listSipDispatchRule.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(service.listSipDispatchRule()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteSipDispatchRule', () => {
    it('delegates to SipClient.deleteSipDispatchRule and returns its result', async () => {
      // Arrange
      const { service, client } = buildService();
      const rule = {
        sipDispatchRuleId: 'DR_1',
      } as unknown as SIPDispatchRuleInfo;
      client.deleteSipDispatchRule.mockResolvedValue(rule);

      // Act
      const result = await service.deleteSipDispatchRule('DR_1');

      // Assert
      expect(client.deleteSipDispatchRule).toHaveBeenCalledWith('DR_1');
      expect(result).toBe(rule);
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService();
      client.deleteSipDispatchRule.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.deleteSipDispatchRule('DR_1'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('createSipParticipant', () => {
    it('uses the caller-supplied trunkId when provided', async () => {
      // Arrange
      const { service, client } = buildService('cfg-trunk');
      const participant = {
        sipCallId: 'SCID_1',
      } as unknown as SIPParticipantInfo;
      client.createSipParticipant.mockResolvedValue(participant);

      // Act
      await service.createSipParticipant({
        trunkId: 'caller-trunk',
        sipCallTo: '+15555550100',
        roomName: 'room-1',
        participantIdentity: 'caller:user-1',
      });

      // Assert
      expect(client.createSipParticipant).toHaveBeenCalledWith(
        'caller-trunk',
        '+15555550100',
        'room-1',
        expect.objectContaining({
          participantIdentity: 'caller:user-1',
        }),
      );
    });

    it('falls back to LiveKitConfig.sipTrunkId when caller omits trunkId', async () => {
      // Arrange
      const { service, client } = buildService('cfg-trunk');
      const participant = {
        sipCallId: 'SCID_2',
      } as unknown as SIPParticipantInfo;
      client.createSipParticipant.mockResolvedValue(participant);

      // Act
      await service.createSipParticipant({
        sipCallTo: '+15555550100',
        roomName: 'room-1',
        participantIdentity: 'caller:user-1',
      });

      // Assert
      expect(client.createSipParticipant).toHaveBeenCalledWith(
        'cfg-trunk',
        '+15555550100',
        'room-1',
        expect.objectContaining({
          participantIdentity: 'caller:user-1',
        }),
      );
    });

    it('throws BadRequestException when both caller and config trunkId are missing', async () => {
      // Arrange
      const { service, client } = buildService(undefined);

      // Act + Assert
      await expect(
        service.createSipParticipant({
          sipCallTo: '+15555550100',
          roomName: 'room-1',
          participantIdentity: 'caller:user-1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(client.createSipParticipant).not.toHaveBeenCalled();
    });

    it('forwards participantName and krispEnabled options to the SDK', async () => {
      // Arrange
      const { service, client } = buildService('cfg-trunk');
      const participant = {
        sipCallId: 'SCID_3',
      } as unknown as SIPParticipantInfo;
      client.createSipParticipant.mockResolvedValue(participant);

      // Act
      await service.createSipParticipant({
        sipCallTo: '+15555550100',
        roomName: 'room-1',
        participantIdentity: 'caller:user-1',
        participantName: 'Alex',
        krispEnabled: true,
      });

      // Assert
      expect(client.createSipParticipant).toHaveBeenCalledWith(
        'cfg-trunk',
        '+15555550100',
        'room-1',
        {
          participantIdentity: 'caller:user-1',
          participantName: 'Alex',
          krispEnabled: true,
        },
      );
    });

    it('wraps SDK failures as InternalServerErrorException', async () => {
      // Arrange
      const { service, client } = buildService('cfg-trunk');
      client.createSipParticipant.mockRejectedValue(new Error('boom'));

      // Act + Assert
      await expect(
        service.createSipParticipant({
          sipCallTo: '+15555550100',
          roomName: 'room-1',
          participantIdentity: 'caller:user-1',
        }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
