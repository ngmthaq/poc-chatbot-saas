import type { ApiKeyScope } from '@prisma/client';

export interface RequestContext {
  tenantId: string;
  apiKeyId: string;
  scopes: ApiKeyScope[];
  botId: string | null;
  effectiveBotId?: string | null;
}
