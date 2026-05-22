import { healthService } from '../services/health.service';
import type { AsyncRequestHandler } from '../types/async-handler';
import { asyncHandler } from '../utils/async-handler';

export class HealthController {
  public readonly getStatus: AsyncRequestHandler = asyncHandler((_req, res) => {
    res.status(200).json(healthService.getStatus());
  });
}

export const healthController = new HealthController();
