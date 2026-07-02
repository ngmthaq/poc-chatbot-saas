/**
 * Sentinel thrown by `TenantService` when a write violates the unique `slug`
 * constraint (Prisma `P2002`). The controller catches this to map it to a 409,
 * keeping HTTP concerns out of the service.
 */
export class TenantSlugConflictError extends Error {
  public constructor() {
    super('Tenant slug already in use');
    this.name = 'TenantSlugConflictError';
  }
}
