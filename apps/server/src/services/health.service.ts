import type { HealthStatus } from '../types/health';
import { loggerUtil, prismaUtil } from '../utils';

export class HealthService {
  public async getStatus(): Promise<HealthStatus> {
    try {
      await prismaUtil.client.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        db: 'ok',
      };
    } catch (error: unknown) {
      loggerUtil.instance.error({ error }, 'Database health check failed');
      return {
        status: 'ok',
        db: 'down',
      };
    }
  }
}

export const healthService = new HealthService();
