import type { RequestHandler } from 'express';
import { webhookService } from '../services/webhook.service';

export class WebhookController {
  public readonly receive: RequestHandler = (req) => {
    try {
      const rawBody = req.body as string;
      const authHeader = req.headers.authorization ?? null;
      return webhookService.receive(rawBody, authHeader);
    } catch (error) {
      console.error('Failed to process webhook event:', error);
      return {};
    }
  };
}

export const webhookController = new WebhookController();
