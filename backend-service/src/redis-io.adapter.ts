import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

import { RedisIoAdapterOptions } from './shared/interfaces';

import type { Server, ServerOptions } from 'socket.io';

// The runtime IoAdapter (v10) accepts the Nest app via the inherited
// AbstractWsAdapter constructor, but its bundled .d.ts file only re-declares
// its own members. We cast via a typed alias so callers can pass the Nest app
// instance without TS complaints.
const TypedIoAdapter = IoAdapter as unknown as new (
  appOrHttpServer?: INestApplicationContext,
) => IoAdapter;

export class RedisIoAdapter extends TypedIoAdapter {
  private adapterConstructor!: ReturnType<typeof createAdapter>;

  connectToRedis(opts: RedisIoAdapterOptions): Promise<void> {
    const pub = new Redis({
      host: opts.host,
      port: opts.port,
      password: opts.password,
    });
    const sub = pub.duplicate();
    this.adapterConstructor = createAdapter(pub, sub);
    return Promise.resolve();
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;
    server.adapter(this.adapterConstructor);
    return server;
  }
}
