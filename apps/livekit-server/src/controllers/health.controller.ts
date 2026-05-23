import type { RequestHandler } from 'express';
import { HealthService } from '../services/health.service';

export class HealthController {
  private readonly healthService = new HealthService();

  public readonly getStatus: RequestHandler = () => {
    return this.healthService.getStatus();
  };
}
