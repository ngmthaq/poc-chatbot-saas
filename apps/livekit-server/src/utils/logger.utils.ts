import pino from 'pino';
import { loadConfig } from '../configs/env';

const config = loadConfig();
const level = config.NODE_ENV === 'production' ? 'info' : 'debug';

export const logger = pino({ level });
