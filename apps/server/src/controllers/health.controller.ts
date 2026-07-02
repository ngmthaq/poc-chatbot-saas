import type { RequestHandler } from 'express';
import { healthService } from '../services';

export class HealthController {
  public readonly getStatus: RequestHandler = () => {
    return healthService.getStatus();
  };
}

export const healthController = new HealthController();
