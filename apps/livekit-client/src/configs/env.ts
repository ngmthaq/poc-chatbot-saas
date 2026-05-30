import * as yup from 'yup';

const schema = yup.object().shape({
  VITE_API_BASE_URL: yup
    .string()
    .trim()
    .required('VITE_API_BASE_URL is required'),
  VITE_LIVEKIT_URL: yup
    .string()
    .trim()
    .required('VITE_LIVEKIT_URL is required'),
});

type EnvSchema = yup.InferType<typeof schema>;

let config = {} as Readonly<{
  apiBaseUrl: string;
  livekitUrl: string;
}>;

function loadConfig() {
  if (Object.keys(config).length === 0) {
    let validated: EnvSchema;

    try {
      validated = schema.validateSync(
        import.meta.env as Record<string, unknown>,
        {
          abortEarly: false,
          stripUnknown: true,
        },
      );
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        throw new Error(err.errors.join(', '));
      }
      throw err;
    }

    config = {
      apiBaseUrl: validated.VITE_API_BASE_URL,
      livekitUrl: validated.VITE_LIVEKIT_URL,
    } as const;
  }

  return config;
}

export { loadConfig };
