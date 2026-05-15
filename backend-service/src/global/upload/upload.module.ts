import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

import { UploadService } from './upload.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new UploadService(config).getMulterOptions(),
    }),
  ],
  providers: [UploadService],
  exports: [MulterModule, UploadService],
})
export class UploadModule {}
