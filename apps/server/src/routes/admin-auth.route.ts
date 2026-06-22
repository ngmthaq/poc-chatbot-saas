import { Router } from 'express';
import { AdminAuthController } from '../controllers/admin-auth.controller';
import { authRateLimitHandler } from '../middlewares';
import { requestValidator } from '../middlewares/request-validator.middleware';
import { responseHandler } from '../utils/response-handler.utils';
import { adminLoginSchema } from '../validators/admin-login.validator';
import { adminLogoutSchema } from '../validators/admin-logout.validator';
import { adminRefreshSchema } from '../validators/admin-refresh.validator';

const router: Router = Router();
const adminAuthController = new AdminAuthController();

router.post(
  '/login',
  authRateLimitHandler,
  requestValidator({
    target: 'body',
    schema: adminLoginSchema,
  }),
  responseHandler(adminAuthController.handleLogin),
);

router.post(
  '/refresh',
  authRateLimitHandler,
  requestValidator({
    target: 'body',
    schema: adminRefreshSchema,
  }),
  responseHandler(adminAuthController.handleRefresh),
);

router.post(
  '/logout',
  authRateLimitHandler,
  requestValidator({
    target: 'body',
    schema: adminLogoutSchema,
  }),
  responseHandler(adminAuthController.handleLogout),
);

export default router;
