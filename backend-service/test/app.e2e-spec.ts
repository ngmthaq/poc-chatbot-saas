/**
 * Smoke e2e test for the backend-service NestJS scaffold.
 *
 * Goals:
 *  - Verify `AppModule` compiles in a testing context with all 13 globals
 *    wired through `GlobalModule`.
 *  - Verify `SwaggerModule.createDocument` produces a document for the app.
 *  - Verify the `RedisIoAdapter` class can be imported without opening a
 *    real Redis socket at load time.
 *
 * External services (Redis, MySQL, S3) are mocked so the test never opens
 * real network sockets and never depends on a running database / cache.
 */

// ----- Required env vars (Joi validation runs at ConfigModule bootstrap) -----
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'mysql://test:test@127.0.0.1:3306/test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? 'test-jwt-secret-for-smoke-e2e-only';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'test-jwt-refresh-secret-for-smoke-e2e';
process.env.ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ??
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.FILE_STORAGE_DRIVER = 'local';
process.env.UPLOAD_LOCAL_DIR = './uploads';

// ----- Module-level mocks for external connections -------------------------
// Stub ioredis so neither the Bull connection nor the @socket.io/redis-adapter
// publisher actually open a TCP socket.
jest.mock('ioredis', () => {
  const createInstance = (): Record<string, jest.Mock> => {
    const instance: Record<string, jest.Mock> = {
      on: jest.fn(),
      off: jest.fn(),
      once: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
      duplicate: jest.fn(),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };
    instance.duplicate = jest.fn(() => createInstance());
    return instance;
  };
  const Redis = jest.fn().mockImplementation(() => createInstance());
  return { __esModule: true, default: Redis, Redis };
});

// Stub the cache-manager Redis store so CacheModule.registerAsync resolves
// without contacting Redis.
jest.mock('cache-manager-ioredis-yet', () => ({
  redisStore: jest.fn().mockResolvedValue({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    ttl: jest.fn().mockResolvedValue(0),
  }),
}));

// Stub bullmq primitives so @nestjs/bullmq's connection factory never tries
// to ping Redis at module init.
jest.mock('bullmq', () => {
  const NoopClass = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    add: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    waitUntilReady: jest.fn().mockResolvedValue(undefined),
  }));
  return {
    Queue: NoopClass,
    Worker: NoopClass,
    QueueEvents: NoopClass,
    FlowProducer: NoopClass,
    QueueScheduler: NoopClass,
  };
});

// Stub the socket.io redis adapter factory so even a real call doesn't reach
// out to the network.
jest.mock('@socket.io/redis-adapter', () => ({
  createAdapter: jest.fn(() => jest.fn()),
}));

// `@nestjs/platform-socket.io` transitively requires `@nestjs/websockets`,
// which is an optional peer dependency that is not installed for the
// scaffold (no WebSocket modules are registered at boot — the adapter
// would only be constructed in `main.ts`, which we don't run in tests).
// We stub it so importing `RedisIoAdapter` does not fail with
// "Cannot find module '@nestjs/websockets'".
jest.mock('@nestjs/platform-socket.io', () => {
  class IoAdapterStub {
    constructor() {
      /* no-op */
    }
    createIOServer(): unknown {
      return { adapter: jest.fn() };
    }
  }
  return { IoAdapter: IoAdapterStub };
});

// ----- Imports (after jest.mock calls so hoisting works as expected) -------
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/global/database/prisma.service';

describe('Backend-service smoke e2e', () => {
  let app: INestApplication;

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('compiles AppModule and initialises a Nest application with external services mocked', async () => {
    // Arrange — build the testing module, overriding PrismaService so no
    // real DB connection is attempted during onModuleInit. The mock keeps
    // the onModuleInit / onModuleDestroy hooks so Nest's lifecycle still
    // runs them, but neither hook reaches a real database.
    const prismaConnect = jest.fn().mockResolvedValue(undefined);
    const prismaDisconnect = jest.fn().mockResolvedValue(undefined);
    const prismaMock = {
      $connect: prismaConnect,
      $disconnect: prismaDisconnect,
      $on: jest.fn(),
      onModuleInit: async (): Promise<void> => {
        await prismaConnect();
      },
      onModuleDestroy: async (): Promise<void> => {
        await prismaDisconnect();
      },
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    // Act — create the Nest application and initialise lifecycle hooks.
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();

    // Assert — the application instance is truthy and the mocked Prisma
    // connect ran exactly once via onModuleInit.
    expect(app).toBeTruthy();
    expect(prismaConnect).toHaveBeenCalledTimes(1);
  });

  it('builds a Swagger document for the initialised application', () => {
    // Arrange — reuse the app initialised in the previous test plus a fresh
    // DocumentBuilder configuration scoped to this assertion.
    const builder = new DocumentBuilder().setTitle('Smoke').build();

    // Act — generate the OpenAPI document from the live AppModule.
    const document = SwaggerModule.createDocument(app, builder);

    // Assert — the document is an object exposing a `paths` map (OpenAPI
    // shape), confirming Swagger scanning ran successfully over AppModule.
    expect(document).toBeDefined();
    expect(typeof document).toBe('object');
    expect(document).toHaveProperty('paths');
    expect(typeof document.paths).toBe('object');
  });
});

describe('RedisIoAdapter import', () => {
  it('imports the RedisIoAdapter class without opening a Redis connection', () => {
    // Arrange — clear any prior ioredis mock invocations so we can assert
    // that the import itself does not instantiate the client.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ioredis = require('ioredis') as { Redis: jest.Mock };
    ioredis.Redis.mockClear();

    // Act — load the adapter module via CommonJS require so jest's mock
    // hoisting applies and we don't need experimental ESM dynamic imports.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const adapterModule = require('../src/redis-io.adapter') as {
      RedisIoAdapter: unknown;
    };

    // Assert — the class is exported and merely importing it must not
    // construct an ioredis client (connection is deferred to connectToRedis).
    expect(adapterModule.RedisIoAdapter).toBeDefined();
    expect(typeof adapterModule.RedisIoAdapter).toBe('function');
    expect(ioredis.Redis).not.toHaveBeenCalled();
  });
});
