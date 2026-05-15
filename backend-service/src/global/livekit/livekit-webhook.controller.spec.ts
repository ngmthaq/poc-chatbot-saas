import {
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  LIVEKIT_EVENT_PREFIX,
  LIVEKIT_WEBHOOK_ROUTE,
} from '../../shared/constants';

import { LiveKitWebhookController } from './livekit-webhook.controller';
import { LiveKitConfig } from './livekit.config';

import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

const mockReceive = jest.fn();

jest.mock('livekit-server-sdk', () => ({
  WebhookReceiver: jest.fn().mockImplementation(() => ({
    receive: mockReceive,
  })),
}));

const buildConfig = (
  overrides: Partial<LiveKitConfig> = {},
): LiveKitConfig => ({
  url: 'wss://example',
  apiKey: 'k',
  apiSecret: 's',
  webhookPath: LIVEKIT_WEBHOOK_ROUTE,
  defaultTokenTtlSeconds: 3600,
  sipTrunkId: undefined,
  agentName: 'voice-agent',
  ...overrides,
});

const buildRequest = (rawBody: string | undefined): RawBodyRequest<Request> =>
  ({
    rawBody: rawBody !== undefined ? Buffer.from(rawBody) : undefined,
  }) as unknown as RawBodyRequest<Request>;

const buildEventEmitter = (): {
  emitter: jest.Mocked<EventEmitter2>;
  emit: jest.Mock;
} => {
  const emit = jest.fn();
  const emitter = { emit } as unknown as jest.Mocked<EventEmitter2>;
  return { emitter, emit };
};

const buildController = (config: LiveKitConfig = buildConfig()) => {
  const { emitter, emit } = buildEventEmitter();
  const controller = new LiveKitWebhookController(config, emitter);
  const warnSpy = jest
    .spyOn(controller['logger'], 'warn')
    .mockImplementation(() => undefined);
  const logSpy = jest
    .spyOn(controller['logger'], 'log')
    .mockImplementation(() => undefined);
  return { controller, emitter, emit, warnSpy, logSpy };
};

describe('LiveKitWebhookController', () => {
  beforeEach(() => {
    mockReceive.mockReset();
  });

  describe('onModuleInit (path-drift assertion)', () => {
    it('does nothing when config.webhookPath matches LIVEKIT_WEBHOOK_ROUTE', () => {
      // Arrange
      const { controller } = buildController(
        buildConfig({ webhookPath: LIVEKIT_WEBHOOK_ROUTE }),
      );

      // Act + Assert
      expect(() => controller.onModuleInit()).not.toThrow();
    });

    it('throws when config.webhookPath drifts from LIVEKIT_WEBHOOK_ROUTE', () => {
      // Arrange
      const { controller } = buildController(
        buildConfig({ webhookPath: 'some/other/path' }),
      );

      // Act + Assert
      expect(() => controller.onModuleInit()).toThrow(
        /LiveKit webhook path mismatch/,
      );
    });
  });

  describe('handleWebhook — happy path', () => {
    it('emits a typed event on the EventEmitter2 bus under livekit.<event-name>', async () => {
      // Arrange
      const { controller, emit } = buildController();
      const event = {
        event: 'room_started',
        room: { name: 'room-1' },
        participant: undefined,
        egressInfo: undefined,
        ingressInfo: undefined,
        id: 'evt-1',
        createdAt: 1700000000,
      };
      mockReceive.mockResolvedValue(event);
      const req = buildRequest('{"event":"room_started"}');

      // Act
      const result = await controller.handleWebhook(
        req,
        'valid-auth-header',
        'application/webhook+json',
      );

      // Assert
      expect(emit).toHaveBeenCalledWith(
        `${LIVEKIT_EVENT_PREFIX}.room_started`,
        expect.objectContaining({
          event: 'room_started',
          room: { name: 'room-1' },
          id: 'evt-1',
          createdAt: 1700000000,
        }),
      );
      expect(result).toEqual({ received: true });
    });

    it('accepts application/json with charset suffix', async () => {
      // Arrange
      const { controller, emit } = buildController();
      mockReceive.mockResolvedValue({
        event: 'participant_joined',
        id: 'evt-2',
        createdAt: 1700000001,
      });
      const req = buildRequest('{}');

      // Act
      await controller.handleWebhook(
        req,
        'valid-auth-header',
        'application/json; charset=utf-8',
      );

      // Assert
      expect(emit).toHaveBeenCalledWith(
        `${LIVEKIT_EVENT_PREFIX}.participant_joined`,
        expect.any(Object),
      );
    });
  });

  describe('handleWebhook — invalid signature (security)', () => {
    it('throws UnauthorizedException when receive() rejects', async () => {
      // Arrange
      const { controller } = buildController();
      mockReceive.mockRejectedValue(new Error('signature mismatch'));
      const req = buildRequest('{"event":"room_started"}');

      // Act + Assert
      await expect(
        controller.handleWebhook(
          req,
          'tampered-auth',
          'application/webhook+json',
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('does NOT emit any event when the signature is invalid', async () => {
      // Arrange
      const { controller, emit } = buildController();
      mockReceive.mockRejectedValue(new Error('signature mismatch'));
      const req = buildRequest('{"event":"room_started"}');

      // Act
      await controller
        .handleWebhook(req, 'tampered-auth', 'application/webhook+json')
        .catch(() => undefined);

      // Assert
      expect(emit).not.toHaveBeenCalled();
    });

    it('does not log the raw auth header value when the signature is invalid', async () => {
      // Arrange
      const { controller, warnSpy } = buildController();
      const secretAuth = 'super-secret-auth-bearer-token-DO-NOT-LEAK';
      mockReceive.mockRejectedValue(new Error('signature mismatch'));
      const req = buildRequest('{"event":"room_started"}');

      // Act
      await controller
        .handleWebhook(req, secretAuth, 'application/webhook+json')
        .catch(() => undefined);

      // Assert
      expect(warnSpy).toHaveBeenCalled();
      const loggedArgs = warnSpy.mock.calls.flat();
      const serialised = loggedArgs.map((a) => JSON.stringify(a)).join(' ');
      expect(serialised).not.toContain(secretAuth);
    });

    it('logs only an integer length descriptor for the auth header', async () => {
      // Arrange
      const { controller, warnSpy } = buildController();
      const auth = 'auth-1234567890';
      mockReceive.mockRejectedValue(new Error('signature mismatch'));
      const req = buildRequest('{"event":"room_started"}');

      // Act
      await controller
        .handleWebhook(req, auth, 'application/webhook+json')
        .catch(() => undefined);

      // Assert
      const firstCall: unknown = warnSpy.mock.calls[0]?.[0];
      expect(typeof firstCall).toBe('string');
      expect(firstCall as string).toContain('authHeaderLength');
      expect(firstCall as string).toContain(String(auth.length));
    });
  });

  describe('handleWebhook — unsupported media type', () => {
    it('throws UnsupportedMediaTypeException for text/plain', async () => {
      // Arrange
      const { controller } = buildController();
      const req = buildRequest('not json');

      // Act + Assert
      await expect(
        controller.handleWebhook(req, 'auth', 'text/plain'),
      ).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
    });

    it('throws UnsupportedMediaTypeException when content-type header is missing', async () => {
      // Arrange
      const { controller } = buildController();
      const req = buildRequest('{}');

      // Act + Assert
      await expect(
        controller.handleWebhook(req, 'auth', undefined),
      ).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
    });

    it('does NOT invoke WebhookReceiver.receive when the content-type is rejected', async () => {
      // Arrange
      const { controller } = buildController();
      const req = buildRequest('not json');

      // Act
      await controller
        .handleWebhook(req, 'auth', 'text/plain')
        .catch(() => undefined);

      // Assert
      expect(mockReceive).not.toHaveBeenCalled();
    });
  });
});
