import { ConfigService } from '@nestjs/config';

import { LiveKitConfig } from './livekit.config';

interface ConfigBag {
  [key: string]: string | number | undefined;
}

const buildConfigService = (bag: ConfigBag): ConfigService => {
  const getOrThrow = jest.fn(<T>(key: string): T => {
    if (!(key in bag) || bag[key] === undefined) {
      throw new Error(`Configuration key "${key}" is not defined`);
    }
    return bag[key] as T;
  });
  const get = jest.fn(<T>(key: string): T | undefined => bag[key] as T);

  return {
    getOrThrow,
    get,
  } as unknown as ConfigService;
};

describe('LiveKitConfig', () => {
  describe('happy path', () => {
    it('exposes the typed fields from ConfigService and freezes itself', () => {
      // Arrange
      const configService = buildConfigService({
        LIVEKIT_URL: 'wss://example.livekit.cloud',
        LIVEKIT_API_KEY: 'api-key-123',
        LIVEKIT_API_SECRET: 'api-secret-456',
        LIVEKIT_WEBHOOK_PATH: 'livekit/webhook',
        LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS: 3600,
        LIVEKIT_SIP_TRUNK_ID: 'trunk-1',
        LIVEKIT_AGENT_NAME: 'voice-agent',
      });

      // Act
      const config = new LiveKitConfig(configService);

      // Assert
      expect(config.url).toBe('wss://example.livekit.cloud');
      expect(config.apiKey).toBe('api-key-123');
      expect(config.apiSecret).toBe('api-secret-456');
      expect(config.webhookPath).toBe('livekit/webhook');
      expect(config.defaultTokenTtlSeconds).toBe(3600);
      expect(config.sipTrunkId).toBe('trunk-1');
      expect(config.agentName).toBe('voice-agent');
    });

    it('is frozen after construction', () => {
      // Arrange
      const configService = buildConfigService({
        LIVEKIT_URL: 'wss://example.livekit.cloud',
        LIVEKIT_API_KEY: 'api-key-123',
        LIVEKIT_API_SECRET: 'api-secret-456',
        LIVEKIT_WEBHOOK_PATH: 'livekit/webhook',
        LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS: 3600,
        LIVEKIT_AGENT_NAME: 'voice-agent',
      });

      // Act
      const config = new LiveKitConfig(configService);

      // Assert
      expect(Object.isFrozen(config)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('normalises empty-string sipTrunkId to undefined', () => {
      // Arrange
      const configService = buildConfigService({
        LIVEKIT_URL: 'wss://example.livekit.cloud',
        LIVEKIT_API_KEY: 'api-key-123',
        LIVEKIT_API_SECRET: 'api-secret-456',
        LIVEKIT_WEBHOOK_PATH: 'livekit/webhook',
        LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS: 3600,
        LIVEKIT_SIP_TRUNK_ID: '',
        LIVEKIT_AGENT_NAME: 'voice-agent',
      });

      // Act
      const config = new LiveKitConfig(configService);

      // Assert
      expect(config.sipTrunkId).toBeUndefined();
    });

    it('leaves sipTrunkId undefined when the env var is missing', () => {
      // Arrange
      const configService = buildConfigService({
        LIVEKIT_URL: 'wss://example.livekit.cloud',
        LIVEKIT_API_KEY: 'api-key-123',
        LIVEKIT_API_SECRET: 'api-secret-456',
        LIVEKIT_WEBHOOK_PATH: 'livekit/webhook',
        LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS: 3600,
        LIVEKIT_AGENT_NAME: 'voice-agent',
      });

      // Act
      const config = new LiveKitConfig(configService);

      // Assert
      expect(config.sipTrunkId).toBeUndefined();
    });
  });

  describe('failure cases', () => {
    it('surfaces an error when LIVEKIT_URL is missing', () => {
      // Arrange
      const configService = buildConfigService({
        LIVEKIT_API_KEY: 'api-key-123',
        LIVEKIT_API_SECRET: 'api-secret-456',
        LIVEKIT_WEBHOOK_PATH: 'livekit/webhook',
        LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS: 3600,
        LIVEKIT_AGENT_NAME: 'voice-agent',
      });

      // Act + Assert
      expect(() => new LiveKitConfig(configService)).toThrow(/LIVEKIT_URL/);
    });

    it('surfaces an error when LIVEKIT_AGENT_NAME is missing', () => {
      // Arrange
      const configService = buildConfigService({
        LIVEKIT_URL: 'wss://example.livekit.cloud',
        LIVEKIT_API_KEY: 'api-key-123',
        LIVEKIT_API_SECRET: 'api-secret-456',
        LIVEKIT_WEBHOOK_PATH: 'livekit/webhook',
        LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS: 3600,
      });

      // Act + Assert
      expect(() => new LiveKitConfig(configService)).toThrow(
        /LIVEKIT_AGENT_NAME/,
      );
    });
  });
});
