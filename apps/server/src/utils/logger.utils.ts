import pino from 'pino';
import { loadEnv } from '../configs';

const config = loadEnv();
const level = config.NODE_ENV === 'production' ? 'info' : 'debug';

export const logger = pino({ level });
