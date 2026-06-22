import type { ApiKey } from '@prisma/client';
import type { AuthenticatedAdmin } from './admin-auth';
import type { RequestContext } from './request-context';

declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKey;
      context?: RequestContext;
      adminUser?: AuthenticatedAdmin;
    }
  }
}

export {};
