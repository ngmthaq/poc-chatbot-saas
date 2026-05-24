import pino from 'pino';
import { loadConfig } from '../config/env';

const config = loadConfig();
const level = config.nodeEnv === 'production' ? 'info' : 'debug';

export const logger = pino({ level });
