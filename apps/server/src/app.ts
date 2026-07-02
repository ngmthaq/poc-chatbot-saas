import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { ErrorHandlerMiddleware } from './middlewares/error-handler.middleware';
import { NotFoundMiddleware } from './middlewares/not-found.middleware';
import { GlobalRateLimitMiddleware } from './middlewares/rate-limit.middleware';
import router from './routes';
import webhookRouter from './routes/webhook.route';

export const createApp = (): Express => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use('/webhook', webhookRouter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(new GlobalRateLimitMiddleware().handle, router);
  app.use(new NotFoundMiddleware().handle);
  app.use(new ErrorHandlerMiddleware().handle);

  return app;
};
