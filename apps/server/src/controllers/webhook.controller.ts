import type { RequestHandler } from 'express';
import { webhookService } from '../services';

export class WebhookController {
  public readonly receive: RequestHandler = async (req) => {
    const rawBody = req.body as string;
    const authHeader = req.headers.authorization ?? null;
    await webhookService.receive(rawBody, authHeader).catch(() => {});
  };
}

export const webhookController = new WebhookController();
