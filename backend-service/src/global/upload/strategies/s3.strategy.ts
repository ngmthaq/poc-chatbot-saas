import { randomUUID } from 'crypto';
import { extname } from 'path';

import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import multerS3 from 'multer-s3';

import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export function buildS3MulterOptions(config: ConfigService): MulterOptions {
  const region = config.get<string>('AWS_REGION');
  const bucket = config.get<string>('AWS_S3_BUCKET');
  const accessKeyId = config.get<string>('AWS_ACCESS_KEY_ID') || undefined;
  const secretAccessKey =
    config.get<string>('AWS_SECRET_ACCESS_KEY') || undefined;

  if (!region || !bucket) {
    throw new Error(
      's3 upload strategy requires AWS_REGION and AWS_S3_BUCKET to be set.',
    );
  }

  const s3 = new S3Client({
    region,
    credentials:
      accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey }
        : undefined,
  });

  // Bind AUTO_CONTENT_TYPE explicitly to avoid unbound-method lint warning.
  const autoContentType = multerS3.AUTO_CONTENT_TYPE.bind(multerS3);

  return {
    storage: multerS3({
      s3,
      bucket,
      contentType: autoContentType,
      key: (_req, file, cb) => {
        const ext = extname(file.originalname);
        cb(null, `${Date.now()}-${randomUUID()}${ext}`);
      },
    }),
  };
}
