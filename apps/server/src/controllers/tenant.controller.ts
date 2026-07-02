import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { errorMessages } from '../configs';
import { TenantSlugConflictError } from '../exceptions';
import { TenantService } from '../services/tenant.service';
import type {
  CreateTenantBody,
  ListTenantsQuery,
  UpdateTenantBody,
} from '../validators/tenant.validator';

export class TenantController {
  private readonly tenantService = new TenantService();

  /**
   * Handles `POST /admin/tenants`. Creates a tenant and returns `{ tenant }`
   * wrapped with a 201. A slug collision surfaces as a 409.
   */
  public readonly handleCreate: RequestHandler = async (req, res) => {
    try {
      const tenant = await this.tenantService.create(
        req.body as CreateTenantBody,
      );
      res.status(201);
      return { tenant };
    } catch (err) {
      if (err instanceof TenantSlugConflictError) {
        throw createHttpError(409, errorMessages.slugConflict());
      }
      throw err;
    }
  };

  /**
   * Handles `GET /admin/tenants`. Returns the paginated `{ items, total }` page
   * for the validated query, wrapped with a 200.
   */
  public readonly handleList: RequestHandler = async (req) => {
    return this.tenantService.list(req.query as unknown as ListTenantsQuery);
  };

  /**
   * Handles `GET /admin/tenants/:id`. Returns `{ tenant }` (with child counts)
   * wrapped with a 200, or a 404 when no tenant matches.
   */
  public readonly handleGet: RequestHandler = async (req) => {
    const tenant = await this.tenantService.getByIdWithCounts(
      req.params.id as string,
    );

    if (tenant === null) {
      throw createHttpError(404, errorMessages.tenantNotFound());
    }

    return { tenant };
  };

  /**
   * Handles `PATCH /admin/tenants/:id`. Applies the validated partial update and
   * returns `{ tenant }` wrapped with a 200; a missing tenant yields a 404 and a
   * slug collision a 409.
   */
  public readonly handleUpdate: RequestHandler = async (req) => {
    try {
      const tenant = await this.tenantService.update(
        req.params.id as string,
        req.body as UpdateTenantBody,
      );

      if (tenant === null) {
        throw createHttpError(404, errorMessages.tenantNotFound());
      }

      return { tenant };
    } catch (err) {
      if (err instanceof TenantSlugConflictError) {
        throw createHttpError(409, errorMessages.slugConflict());
      }
      throw err;
    }
  };

  /**
   * Handles `DELETE /admin/tenants/:id`. Soft-archives the tenant and replies
   * with a true 204 (no envelope); a missing tenant yields a 404.
   */
  public readonly handleDelete: RequestHandler = async (req, res) => {
    const tenant = await this.tenantService.archive(req.params.id as string);

    if (tenant === null) {
      throw createHttpError(404, errorMessages.tenantNotFound());
    }

    res.status(204).end();
  };
}
