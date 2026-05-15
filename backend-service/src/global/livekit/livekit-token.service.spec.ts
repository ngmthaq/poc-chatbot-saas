import { InternalServerErrorException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import {
  LIVEKIT_AGENT_IDENTITY_PREFIX,
  LIVEKIT_CALLER_IDENTITY_PREFIX,
  LIVEKIT_SUPERVISOR_IDENTITY_PREFIX,
} from '../../shared/constants/livekit.constants';

import { LiveKitTokenService } from './livekit-token.service';
import { LiveKitConfig } from './livekit.config';

interface DecodedClaim {
  sub?: string;
  iss?: string;
  name?: string;
  metadata?: string;
  exp?: number;
  iat?: number;
  video?: Record<string, unknown>;
}

const buildConfig = (
  overrides: Partial<LiveKitConfig> = {},
): LiveKitConfig => ({
  url: 'wss://example',
  apiKey: 'api-key-test',
  apiSecret: 'api-secret-must-be-at-least-32-bytes-long-aaaa',
  webhookPath: 'livekit/webhook',
  defaultTokenTtlSeconds: 1800,
  sipTrunkId: undefined,
  agentName: 'voice-agent',
  ...overrides,
});

const decode = (token: string): DecodedClaim => {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Token did not decode to a JWT claim object');
  }
  return decoded;
};

const buildService = (config: LiveKitConfig = buildConfig()) => {
  const service = new LiveKitTokenService(config);
  jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
  jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  return service;
};

describe('LiveKitTokenService', () => {
  describe('createAccessToken', () => {
    it('produces a JWT whose decoded payload contains the identity, room grant, and ttl', async () => {
      // Arrange
      const service = buildService();
      const nowSeconds = Math.floor(Date.now() / 1000);

      // Act
      const token = await service.createAccessToken({
        identity: 'caller:u1',
        roomName: 'room-1',
        ttlSeconds: 600,
      });

      // Assert
      const claims = decode(token);
      expect(claims.sub).toBe('caller:u1');
      expect(claims.video).toEqual(
        expect.objectContaining({ roomJoin: true, room: 'room-1' }),
      );
      const reference = claims.iat ?? nowSeconds;
      const ttl = (claims.exp ?? 0) - reference;
      expect(ttl).toBeGreaterThanOrEqual(599);
      expect(ttl).toBeLessThanOrEqual(601);
    });

    it('falls back to LiveKitConfig.defaultTokenTtlSeconds when caller omits ttlSeconds', async () => {
      // Arrange
      const service = buildService(
        buildConfig({ defaultTokenTtlSeconds: 1800 }),
      );
      const nowSeconds = Math.floor(Date.now() / 1000);

      // Act
      const token = await service.createAccessToken({
        identity: 'caller:u1',
        roomName: 'room-1',
      });

      // Assert
      const claims = decode(token);
      const reference = claims.iat ?? nowSeconds;
      const ttl = (claims.exp ?? 0) - reference;
      expect(ttl).toBeGreaterThanOrEqual(1799);
      expect(ttl).toBeLessThanOrEqual(1801);
    });

    it('forwards optional metadata and name fields onto the JWT', async () => {
      // Arrange
      const service = buildService();

      // Act
      const token = await service.createAccessToken({
        identity: 'caller:u1',
        roomName: 'room-1',
        name: 'Alex',
        metadata: 'meta-blob',
      });

      // Assert
      const claims = decode(token);
      expect(claims.name).toBe('Alex');
      expect(claims.metadata).toBe('meta-blob');
    });

    it('wraps unexpected errors as InternalServerErrorException', async () => {
      // Arrange — empty apiSecret makes AccessToken.toJwt() reject
      const service = buildService(buildConfig({ apiSecret: '' }));

      // Act + Assert
      await expect(
        service.createAccessToken({
          identity: 'caller:u1',
          roomName: 'room-1',
        }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('createCallerToken', () => {
    it('prefixes the identity with caller: and grants canPublish + canSubscribe', async () => {
      // Arrange
      const service = buildService();

      // Act
      const token = await service.createCallerToken({
        identity: 'u1',
        roomName: 'room-1',
      });

      // Assert
      const claims = decode(token);
      expect(claims.sub).toBe(`${LIVEKIT_CALLER_IDENTITY_PREFIX}u1`);
      expect(claims.video).toEqual(
        expect.objectContaining({
          roomJoin: true,
          room: 'room-1',
          canPublish: true,
          canSubscribe: true,
        }),
      );
    });

    it('does not double-prefix an identity that already starts with caller:', async () => {
      // Arrange
      const service = buildService();

      // Act
      const token = await service.createCallerToken({
        identity: `${LIVEKIT_CALLER_IDENTITY_PREFIX}u1`,
        roomName: 'room-1',
      });

      // Assert
      const claims = decode(token);
      expect(claims.sub).toBe(`${LIVEKIT_CALLER_IDENTITY_PREFIX}u1`);
    });
  });

  describe('createAgentToken', () => {
    it('prefixes the identity with agent: and grants agent + canPublishData', async () => {
      // Arrange
      const service = buildService();

      // Act
      const token = await service.createAgentToken({
        identity: 'voice-1',
        roomName: 'room-1',
      });

      // Assert
      const claims = decode(token);
      expect(claims.sub).toBe(`${LIVEKIT_AGENT_IDENTITY_PREFIX}voice-1`);
      expect(claims.video).toEqual(
        expect.objectContaining({
          roomJoin: true,
          room: 'room-1',
          agent: true,
          canPublishData: true,
        }),
      );
    });

    it('does not double-prefix an identity that already starts with agent:', async () => {
      // Arrange
      const service = buildService();

      // Act
      const token = await service.createAgentToken({
        identity: `${LIVEKIT_AGENT_IDENTITY_PREFIX}voice-1`,
        roomName: 'room-1',
      });

      // Assert
      const claims = decode(token);
      expect(claims.sub).toBe(`${LIVEKIT_AGENT_IDENTITY_PREFIX}voice-1`);
    });
  });

  describe('createSupervisorToken', () => {
    it('prefixes the identity with supervisor: and grants canPublish + canSubscribe + canUpdateOwnMetadata', async () => {
      // Arrange
      const service = buildService();

      // Act
      const token = await service.createSupervisorToken({
        identity: 'sup-1',
        roomName: 'room-1',
      });

      // Assert
      const claims = decode(token);
      expect(claims.sub).toBe(`${LIVEKIT_SUPERVISOR_IDENTITY_PREFIX}sup-1`);
      expect(claims.video).toEqual(
        expect.objectContaining({
          roomJoin: true,
          room: 'room-1',
          canPublish: true,
          canSubscribe: true,
          canUpdateOwnMetadata: true,
        }),
      );
    });

    it('omits the hidden grant by default', async () => {
      // Arrange
      const service = buildService();

      // Act
      const token = await service.createSupervisorToken({
        identity: 'sup-1',
        roomName: 'room-1',
      });

      // Assert
      const claims = decode(token);
      expect(claims.video?.hidden).toBeFalsy();
    });

    it('adds the hidden grant when opts.hidden is true', async () => {
      // Arrange
      const service = buildService();

      // Act
      const token = await service.createSupervisorToken({
        identity: 'sup-1',
        roomName: 'room-1',
        hidden: true,
      });

      // Assert
      const claims = decode(token);
      expect(claims.video).toEqual(expect.objectContaining({ hidden: true }));
    });

    it('does not double-prefix an identity that already starts with supervisor:', async () => {
      // Arrange
      const service = buildService();

      // Act
      const token = await service.createSupervisorToken({
        identity: `${LIVEKIT_SUPERVISOR_IDENTITY_PREFIX}sup-1`,
        roomName: 'room-1',
      });

      // Assert
      const claims = decode(token);
      expect(claims.sub).toBe(`${LIVEKIT_SUPERVISOR_IDENTITY_PREFIX}sup-1`);
    });
  });
});
