import type { HealthStatus } from '../types/health';
import { logger } from '../utils/logger.utils';
import { prisma } from '../utils/prisma.utils';

export class HealthService {
  public async getStatus(): Promise<HealthStatus> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        db: 'ok',
      };
    } catch (error: unknown) {
      logger.error({ error }, 'Database health check failed');
      return {
        status: 'ok',
        db: 'down',
      };
    }
  }
}
