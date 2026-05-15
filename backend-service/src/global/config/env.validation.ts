import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().integer().min(0).max(65535).default(3000),
  API_PREFIX: Joi.string().default('api'),

  DATABASE_URL: Joi.string().uri({ allowRelative: false }).required(),

  REDIS_HOST: Joi.string().default('127.0.0.1'),
  REDIS_PORT: Joi.number().integer().min(0).max(65535).default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  ENCRYPTION_KEY: Joi.string()
    .length(64)
    .hex()
    .required()
    .description('AES-256-GCM key encoded as 64 hex chars (32 bytes)'),

  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(4).max(15).default(10),

  THROTTLE_TTL: Joi.number().integer().min(1).default(60),
  THROTTLE_LIMIT: Joi.number().integer().min(1).default(100),

  FILE_STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
  UPLOAD_LOCAL_DIR: Joi.string().default('./uploads'),

  AWS_REGION: Joi.string().when('FILE_STORAGE_DRIVER', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional().allow(''),
  }),
  AWS_S3_BUCKET: Joi.string().when('FILE_STORAGE_DRIVER', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional().allow(''),
  }),
  AWS_ACCESS_KEY_ID: Joi.string().optional().allow(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional().allow(''),

  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default('info'),
  SWAGGER_PATH: Joi.string().default('docs'),
  CORS_ORIGINS: Joi.string().default('*'),

  LIVEKIT_URL: Joi.string()
    .pattern(/^(wss?|https?):\/\//)
    .required(),
  LIVEKIT_API_KEY: Joi.string().required(),
  LIVEKIT_API_SECRET: Joi.string().min(16).required(),
  LIVEKIT_WEBHOOK_PATH: Joi.string().default('livekit/webhook'),
  LIVEKIT_SIP_TRUNK_ID: Joi.string().allow('').optional(),
  LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS: Joi.number()
    .integer()
    .min(60)
    .default(3600),
  LIVEKIT_AGENT_NAME: Joi.string().default('voice-agent'),
});
