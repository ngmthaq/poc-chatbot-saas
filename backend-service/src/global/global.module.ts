import { Global, Module } from '@nestjs/common';

import { AuthModule } from './auth';
import { CacheModule } from './cache';
import { ConfigModule } from './config';
import { CryptoModule } from './crypto';
import { PrismaModule } from './database';
import { EventModule } from './event';
import { HashModule } from './hash';
import { HttpModule } from './http';
import { LiveKitModule } from './livekit';
import { LoggerModule } from './logger';
import { QueueModule } from './queue';
import { ScheduleModule } from './schedule';
import { ThrottlerModule } from './throttler';
import { UploadModule } from './upload';

const modules = [
  ConfigModule,
  LoggerModule,
  PrismaModule,
  CacheModule,
  QueueModule,
  ScheduleModule,
  EventModule,
  HttpModule,
  CryptoModule,
  HashModule,
  AuthModule,
  UploadModule,
  ThrottlerModule,
  LiveKitModule,
];

@Global()
@Module({
  imports: modules,
  exports: modules,
})
export class GlobalModule {}
