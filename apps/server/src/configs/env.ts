import { ProviderType } from '@call-center-agent/deepagent';
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
  // Text-chat (deepagent) LLM provider selection.
  LLM_PROVIDER: yup
    .mixed<ProviderType>()
    .oneOf(Object.values(ProviderType))
    .default(ProviderType.OPENAI),
  // Provider API keys are read from process.env directly by LangChain/harness;
  // declared here as optional for visibility/documentation only.
  OPENAI_API_KEY: yup.string().trim().optional(),
  MISTRAL_API_KEY: yup.string().trim().optional(),
  ANTHROPIC_API_KEY: yup.string().trim().optional(),
  TWELVE_DATA_API_KEY: yup.string().trim().optional(),
  TAVILY_API_KEY: yup.string().trim().optional(),
  // Runtime kill switch for voice mode. Default true (backward compatible —
  // unset means voice enabled). Env values are strings, and yup's default
  // boolean cast treats any non-empty string (including "false") as true, so
  // we transform "false"/"0" explicitly before casting.
  VOICE_MODE_ENABLED: yup
    .boolean()
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string') {
        const normalized = originalValue.trim().toLowerCase();
        if (normalized === 'false' || normalized === '0') {
          return false;
        }
        if (normalized === 'true' || normalized === '1') {
          return true;
        }
      }
      return value;
    })
    .default(true),
});

type Config = yup.InferType<typeof schema>;

let config = {} as Config;

function loadEnv(): Config {
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

export { loadEnv };
