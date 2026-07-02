import { Router } from 'express';
import { adminAuthController } from '../controllers';
import {
  authRateLimitMiddleware,
  requestValidatorMiddleware,
} from '../middlewares';
import { responseHandlerUtil } from '../utils';
import {
  adminLoginSchema,
  adminLogoutSchema,
  adminRefreshSchema,
} from '../validators';

const router: Router = Router();

router.use(authRateLimitMiddleware.handle);

router.post(
  '/login',
  requestValidatorMiddleware.handle({
    target: 'body',
    schema: adminLoginSchema,
  }),
  responseHandlerUtil.handle(adminAuthController.handleLogin),
);

router.post(
  '/refresh',
  requestValidatorMiddleware.handle({
    target: 'body',
    schema: adminRefreshSchema,
  }),
  responseHandlerUtil.handle(adminAuthController.handleRefresh),
);

router.post(
  '/logout',
  requestValidatorMiddleware.handle({
    target: 'body',
    schema: adminLogoutSchema,
  }),
  responseHandlerUtil.handle(adminAuthController.handleLogout),
);

export default router;
