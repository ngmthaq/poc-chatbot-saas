import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import multer from 'multer';
import { extname } from 'node:path';
import { errorMessages } from '../configs';
import type { FileValidatorOptions } from '../types/file-validator';

function normaliseFiles(
  raw: Express.Multer.File[] | Record<string, Express.Multer.File[]>,
): Express.Multer.File[] {
  if (Array.isArray(raw)) return raw;
  return Object.values(raw).flat();
}

function validateFiles(
  files: Express.Multer.File[],
  options: FileValidatorOptions,
): ReturnType<typeof createHttpError> | null {
  if (files.length === 0) {
    return createHttpError(400, errorMessages.noFilesUploaded());
  }

  if (options.maxFiles !== undefined && files.length > options.maxFiles) {
    return createHttpError(400, errorMessages.tooManyFiles(options.maxFiles));
  }

  if (options.maxFileSize !== undefined) {
    for (const file of files) {
      if (file.size > options.maxFileSize) {
        return createHttpError(
          400,
          errorMessages.fileTooLarge(options.maxFileSize),
        );
      }
    }
  }

  if (options.totalFileSize !== undefined) {
    const total = files.reduce((sum, file) => sum + file.size, 0);
    if (total > options.totalFileSize) {
      return createHttpError(
        400,
        errorMessages.totalFileSizeExceeded(options.totalFileSize),
      );
    }
  }

  if (options.fileExtensions !== undefined) {
    const allowlist = options.fileExtensions.map((ext) => {
      const lower = ext.toLowerCase();
      return lower.startsWith('.') ? lower : `.${lower}`;
    });
    for (const file of files) {
      const ext = extname(file.originalname).toLowerCase();
      if (!allowlist.includes(ext)) {
        return createHttpError(
          400,
          errorMessages.invalidFileExtension(options.fileExtensions),
        );
      }
    }
  }

  return null;
}

export function fileValidator(options: FileValidatorOptions): RequestHandler {
  const multerHandler = multer({ storage: multer.memoryStorage() }).array(
    options.fieldName,
  );

  return (req, res, next) => {
    multerHandler(req, res, (err: unknown) => {
      if (err !== undefined && err !== null) {
        return next(
          err instanceof multer.MulterError
            ? createHttpError(400, err.message)
            : err,
        );
      }

      const rawFiles = req.files;
      if (rawFiles === undefined) {
        return next(createHttpError(400, errorMessages.noFilesUploaded()));
      }

      const files = normaliseFiles(rawFiles);
      const validationError = validateFiles(files, options);

      return validationError === null ? next() : next(validationError);
    });
  };
}
