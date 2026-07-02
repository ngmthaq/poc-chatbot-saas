import type { RequestHandler } from 'express';
import { liveKitWebhookService } from '../services';

export class LiveKitWebhookController {
  public readonly receive: RequestHandler = async (req) => {
    const rawBody = req.body as string;
    const authHeader = req.headers.authorization ?? null;
    await liveKitWebhookService.receive(rawBody, authHeader).catch(() => {});
  };
}

export const liveKitWebhookController = new LiveKitWebhookController();
