import type { Tenant } from '@prisma/client';

/**
 * A Tenant enriched with counts of its owned child entities, returned by
 * `TenantService.getByIdWithCounts` for the detail endpoint.
 */
export interface TenantWithCounts extends Tenant {
  counts: {
    bots: number;
    apiKeys: number;
    conversations: number;
    endUsers: number;
  };
}

/**
 * A single page of tenants plus the total matching count, returned by
 * `TenantService.list` so the controller can expose pagination metadata.
 */
export interface PaginatedTenants {
  items: Tenant[];
  total: number;
}
