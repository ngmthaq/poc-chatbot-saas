import { Controller, Get } from '@nestjs/common';

import { Public } from '../../shared/decorators';

@Controller('health')
export class HealthController {
  // @Public() bypasses the global JwtAuthGuard so external probes
  // (Docker healthcheck, load balancers) can reach this route unauthenticated.
  @Public()
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
