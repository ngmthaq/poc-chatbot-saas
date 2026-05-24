import type { RequestHandler } from 'express';
import { WebhookService } from '../services/webhook.service';

export class WebhookController {
  private readonly webhookService = new WebhookService();

  public readonly receive: RequestHandler = async (req) => {
    const rawBody = req.body as string;
    const authHeader = req.headers.authorization ?? null;
    await this.webhookService.receive(rawBody, authHeader);
  };
}
