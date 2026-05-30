import dotenv from 'dotenv';
import path from 'node:path';
import * as yup from 'yup';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const schema = yup.object().shape({
  PORT: yup.number().integer().positive().default(3000),
  NODE_ENV: yup.string().default('development'),
  LIVEKIT_URL: yup.string().trim().required('LIVEKIT_URL is required'),
  LIVEKIT_API_KEY: yup.string().trim().required('LIVEKIT_API_KEY is required'),
  LIVEKIT_API_SECRET: yup
    .string()
    .trim()
    .required('LIVEKIT_API_SECRET is required'),
  LIVEKIT_AGENT_NAME: yup
    .string()
    .trim()
    .required('LIVEKIT_AGENT_NAME is required'),
});

type Config = yup.InferType<typeof schema>;

let config = {} as Config;

function loadConfig(): Config {
  if (Object.keys(config).length === 0) {
    let validated: Config;

    try {
      validated = schema.validateSync(process.env, {
        abortEarly: false,
        stripUnknown: true,
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        throw new Error(err.errors.join(', '));
      }
      throw err;
    }

    config = validated;
  }

  return config;
}

export { loadConfig };
