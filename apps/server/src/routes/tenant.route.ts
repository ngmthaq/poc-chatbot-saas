import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { adminAuth } from '../middlewares/admin-auth.middleware';
import { requestValidator } from '../middlewares/request-validator.middleware';
import { responseHandler } from '../utils/response-handler.utils';
import {
  createTenantSchema,
  listTenantsQuerySchema,
  updateTenantSchema,
} from '../validators/tenant.validator';

const router: Router = Router();
const tenantController = new TenantController();

router.use(adminAuth());

router.post(
  '/',
  requestValidator({
    target: 'body',
    schema: createTenantSchema,
  }),
  responseHandler(tenantController.handleCreate),
);

router.get(
  '/',
  requestValidator({
    target: 'query',
    schema: listTenantsQuerySchema,
  }),
  responseHandler(tenantController.handleList),
);

router.get('/:id', responseHandler(tenantController.handleGet));

router.patch(
  '/:id',
  requestValidator({
    target: 'body',
    schema: updateTenantSchema,
  }),
  responseHandler(tenantController.handleUpdate),
);

router.delete('/:id', responseHandler(tenantController.handleDelete));

export default router;
