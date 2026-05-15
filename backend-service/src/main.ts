import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis-io.adapter';
import {
  APP_NAME,
  DEFAULT_API_PREFIX,
  DEFAULT_API_VERSION,
  DEFAULT_SWAGGER_PATH,
} from './shared/constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  const corsOriginsRaw = configService.get<string>('CORS_ORIGINS') ?? '*';
  const corsOrigins =
    corsOriginsRaw === '*'
      ? true
      : corsOriginsRaw
          .split(',')
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const apiPrefix =
    configService.get<string>('API_PREFIX') ?? DEFAULT_API_PREFIX;
  app.setGlobalPrefix(apiPrefix);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: DEFAULT_API_VERSION,
  });

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis({
    host: configService.get<string>('REDIS_HOST') ?? '127.0.0.1',
    port: configService.get<number>('REDIS_PORT') ?? 6379,
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
  });
  // The @nestjs/platform-socket.io v10 IoAdapter is structurally compatible
  // with v11's WebSocketAdapter, but the .d.ts files don't expose all
  // inherited members — cast through unknown to satisfy the type checker.
  app.useWebSocketAdapter(redisIoAdapter);

  const swaggerPath =
    configService.get<string>('SWAGGER_PATH') ?? DEFAULT_SWAGGER_PATH;
  const swaggerDoc = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription(`${APP_NAME} API documentation`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerDoc);
  SwaggerModule.setup(swaggerPath, app, document, {
    useGlobalPrefix: false,
    swaggerOptions: { persistAuthorization: true },
  });

  app.enableShutdownHooks();

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}

void bootstrap();
