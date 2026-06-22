import type { ApiKey } from '@prisma/client';
import type { RequestContext } from './request-context';

declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKey;
      context?: RequestContext;
    }
  }
}

export {};
