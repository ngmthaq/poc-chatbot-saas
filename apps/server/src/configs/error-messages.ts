export const errorMessages = {
  internalServerError: () => {
    return 'Internal Server Error';
  },

  noFilesUploaded: () => {
    return 'No files uploaded';
  },

  tooManyFiles: (max: number) => {
    return `Too many files, maximum ${max} allowed`;
  },

  fileTooLarge: (maxSize: number) => {
    return `File too large, maximum size allowed is ${maxSize}`;
  },

  totalFileSizeExceeded: (maxTotalSize: number) => {
    return `Total file size exceeded, maximum size allowed is ${maxTotalSize}`;
  },

  invalidFileExtension: (allowedExtensions: string[]) => {
    return `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`;
  },

  tooManyRequests: () => {
    return 'Too many requests';
  },

  notFound: () => {
    return 'Not Found';
  },

  unauthorized: () => {
    return 'Unauthorized';
  },

  forbidden: () => {
    return 'Forbidden';
  },

  voiceModeDisabled: () => {
    return 'Voice mode is disabled';
  },

  invalidCredentials: () => {
    return 'Invalid email or password';
  },

  tooManyAuthAttempts: () => {
    return 'Too many authentication attempts';
  },

  invalidRefreshToken: () => {
    return 'Invalid or expired refresh token';
  },
} as const;
