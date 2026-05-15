import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { buildLocalMulterOptions } from './strategies/local.strategy';
import { buildS3MulterOptions } from './strategies/s3.strategy';

import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {}

  getMulterOptions(): MulterOptions {
    const driver = this.config.get<string>('FILE_STORAGE_DRIVER') ?? 'local';
    switch (driver) {
      case 'local':
        return buildLocalMulterOptions(this.config);
      case 's3':
        return buildS3MulterOptions(this.config);
      default:
        throw new Error(`Unknown FILE_STORAGE_DRIVER: ${driver}`);
    }
  }
}
