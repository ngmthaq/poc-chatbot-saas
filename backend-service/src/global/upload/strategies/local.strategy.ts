import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname, resolve } from 'path';

import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';

import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export function buildLocalMulterOptions(config: ConfigService): MulterOptions {
  const targetDir = config.get<string>('UPLOAD_LOCAL_DIR') ?? './uploads';
  const absoluteDir = resolve(process.cwd(), targetDir);
  if (!existsSync(absoluteDir)) {
    mkdirSync(absoluteDir, { recursive: true });
  }
  return {
    storage: diskStorage({
      destination: absoluteDir,
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname);
        cb(null, `${randomUUID()}${ext}`);
      },
    }),
  };
}
