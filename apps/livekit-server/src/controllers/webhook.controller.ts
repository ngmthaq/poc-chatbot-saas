import type { RequestHandler } from 'express';
import { WebhookService } from '../services/webhook.service';

export class WebhookController {
  private readonly webhookService = new WebhookService();

  public readonly receive: RequestHandler = (req) => {
    try {
      const rawBody = req.body as string;
      const authHeader = req.headers.authorization ?? null;
      return this.webhookService.receive(rawBody, authHeader);
    } catch (error) {
      console.error('Failed to process webhook event:', error);
      return {};
    }
  };
}
