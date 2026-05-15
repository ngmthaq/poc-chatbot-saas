import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

import { CACHE_DEFAULT_TTL_SECONDS } from '../../shared/constants';

import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST');
        const port = config.get<number>('REDIS_PORT');
        const password = config.get<string>('REDIS_PASSWORD') || undefined;
        const store = await redisStore({
          host,
          port,
          password,
          ttl: CACHE_DEFAULT_TTL_SECONDS * 1000,
        });
        return {
          store: store as unknown as never,
          ttl: CACHE_DEFAULT_TTL_SECONDS * 1000,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class CacheModule {}
