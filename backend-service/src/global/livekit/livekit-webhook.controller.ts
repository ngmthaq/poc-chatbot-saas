/**
 * LiveKit webhook ingress.
 *
 * Mounted at the path baked into the @Controller decorator. A boot-time
 * assertion (OnModuleInit) verifies the runtime LiveKitConfig.webhookPath
 * matches that path and fails fast if they drift apart.
 *
 * Public + SkipThrottle: this endpoint is callable by LiveKit Cloud /
 * the self-hosted server without an internal JWT. Signature validation
 * via WebhookReceiver.receive(body, authHeader) is the only authentication
 * mechanism here — never call receive() with skipAuth=true.
 */
import {
  Controller,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  OnModuleInit,
  Post,
  Req,
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';
import { WebhookReceiver } from 'livekit-server-sdk';

import {
  LIVEKIT_EVENT_PREFIX,
  LIVEKIT_WEBHOOK_ROUTE,
} from '../../shared/constants';
import { Public } from '../../shared/decorators';

import { LiveKitConfig } from './livekit.config';

import type {
  LiveKitWebhookEventName,
  LiveKitWebhookEventPayload,
} from '../../shared/interfaces';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

const ALLOWED_CONTENT_TYPES = new Set([
  'application/webhook+json',
  'application/json',
]);

@Controller(LIVEKIT_WEBHOOK_ROUTE)
export class LiveKitWebhookController implements OnModuleInit {
  private readonly logger = new Logger(LiveKitWebhookController.name);
  private readonly receiver: WebhookReceiver;

  constructor(
    private readonly config: LiveKitConfig,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.receiver = new WebhookReceiver(
      this.config.apiKey,
      this.config.apiSecret,
    );
  }

  onModuleInit(): void {
    if (this.config.webhookPath !== LIVEKIT_WEBHOOK_ROUTE) {
      throw new Error(
        `LiveKit webhook path mismatch: runtime config "${this.config.webhookPath}" ` +
          `does not match @Controller("${LIVEKIT_WEBHOOK_ROUTE}"). ` +
          `Update LIVEKIT_WEBHOOK_PATH or LIVEKIT_WEBHOOK_ROUTE so they agree.`,
      );
    }
  }

  @Public()
  @SkipThrottle()
  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('authorization') auth: string,
    @Headers('content-type') contentType: string | undefined,
  ): Promise<{ received: true }> {
    const baseContentType = (contentType ?? '')
      .split(';')[0]
      .trim()
      .toLowerCase();
    if (!ALLOWED_CONTENT_TYPES.has(baseContentType)) {
      this.logger.warn(
        `Rejected webhook with unsupported content-type ${JSON.stringify({ contentType: baseContentType || null })}`,
      );
      throw new UnsupportedMediaTypeException(
        'LiveKit webhook requires application/webhook+json or application/json',
      );
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.warn('Rejected webhook with missing raw body');
      throw new HttpException('Missing webhook body', HttpStatus.BAD_REQUEST);
    }

    let event: Awaited<ReturnType<WebhookReceiver['receive']>>;
    try {
      event = await this.receiver.receive(rawBody.toString(), auth);
    } catch (err) {
      this.logger.warn(
        `LiveKit webhook signature validation failed ${JSON.stringify({
          authHeaderLength: auth?.length ?? 0,
          reason: err instanceof Error ? err.message : 'unknown',
        })}`,
      );
      throw new UnauthorizedException('Invalid LiveKit webhook signature');
    }

    const eventName = event.event as LiveKitWebhookEventName;
    this.logger.log(
      `Received LiveKit event ${JSON.stringify({
        event: eventName,
        roomName: event.room?.name,
        id: event.id,
      })}`,
    );

    const payload: LiveKitWebhookEventPayload<LiveKitWebhookEventName> = {
      event: eventName,
      room: event.room,
      participant: event.participant,
      egressInfo: event.egressInfo,
      ingressInfo: event.ingressInfo,
      id: event.id,
      createdAt: Number(event.createdAt),
    };

    this.eventEmitter.emit(`${LIVEKIT_EVENT_PREFIX}.${eventName}`, payload);

    return { received: true };
  }
}
