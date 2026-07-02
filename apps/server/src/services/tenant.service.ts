import { Prisma, TenantStatus } from '@prisma/client';
import type { Tenant } from '@prisma/client';
import { TenantSlugConflictError } from '../exceptions';
import type { PaginatedTenants, TenantWithCounts } from '../types/tenant';
import { prismaUtil } from '../utils';
import type {
  CreateTenantBody,
  ListTenantsQuery,
  UpdateTenantBody,
} from '../validators';

export class TenantService {
  /**
   * Creates a tenant from the validated body and returns the persisted row.
   *
   * Throws `TenantSlugConflictError` when the `slug` is already taken (Prisma
   * `P2002`) so the controller can emit a 409; all other errors propagate.
   */
  public async create(body: CreateTenantBody): Promise<Tenant> {
    try {
      return await prismaUtil.client.tenant.create({
        data: { name: body.name, slug: body.slug },
      });
    } catch (err) {
      if (prismaUtil.isUniqueViolation(err)) {
        throw new TenantSlugConflictError();
      }
      throw err;
    }
  }

  /**
   * Returns a single page of tenants plus the total matching count. When
   * `search` is present it filters on `name` or `slug` with a case-insensitive
   * `contains`. Results are ordered by `createdAt` descending. The page query
   * and the count run in one transaction for a consistent snapshot.
   */
  public async list(query: ListTenantsQuery): Promise<PaginatedTenants> {
    const { page, limit, search } = query;

    const where: Prisma.TenantWhereInput =
      search !== undefined && search.length > 0
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {};

    const [items, total] = await prismaUtil.client.$transaction([
      prismaUtil.client.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prismaUtil.client.tenant.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Returns the tenant identified by `id` enriched with counts of its owned
   * bots, API keys, conversations, and end-users, or `null` when no tenant
   * matches.
   */
  public async getByIdWithCounts(id: string): Promise<TenantWithCounts | null> {
    const tenant = await prismaUtil.client.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bots: true,
            apiKeys: true,
            conversations: true,
            endUsers: true,
          },
        },
      },
    });

    if (tenant === null) {
      return null;
    }

    const { _count, ...rest } = tenant;
    return {
      ...rest,
      counts: {
        bots: _count.bots,
        apiKeys: _count.apiKeys,
        conversations: _count.conversations,
        endUsers: _count.endUsers,
      },
    };
  }

  /**
   * Applies a partial update to the tenant identified by `id` and returns the
   * updated row, or `null` when no tenant matches (Prisma `P2025`).
   *
   * Throws `TenantSlugConflictError` when the new `slug` collides with another
   * tenant (Prisma `P2002`) so the controller can emit a 409.
   */
  public async update(
    id: string,
    patch: UpdateTenantBody,
  ): Promise<Tenant | null> {
    try {
      return await prismaUtil.client.tenant.update({
        where: { id },
        data: {
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
          ...(patch.status !== undefined ? { status: patch.status } : {}),
        },
      });
    } catch (err) {
      if (prismaUtil.isRecordNotFound(err)) {
        return null;
      }
      if (prismaUtil.isUniqueViolation(err)) {
        throw new TenantSlugConflictError();
      }
      throw err;
    }
  }

  /**
   * Soft-archives the tenant identified by `id` by setting its status to
   * `ARCHIVED`, returning the updated row or `null` when no tenant matches
   * (Prisma `P2025`).
   */
  public async archive(id: string): Promise<Tenant | null> {
    try {
      return await prismaUtil.client.tenant.update({
        where: { id },
        data: { status: TenantStatus.ARCHIVED },
      });
    } catch (err) {
      if (prismaUtil.isRecordNotFound(err)) {
        return null;
      }
      throw err;
    }
  }
}

export const tenantService = new TenantService();
