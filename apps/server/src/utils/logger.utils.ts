import pino from 'pino';
import type { Logger } from 'pino';
import { loadEnv } from '../configs';

export class LoggerUtil {
  private readonly config = loadEnv();
  private readonly level =
    this.config.NODE_ENV === 'production' ? 'info' : 'debug';
  readonly instance: Logger = pino({ level: this.level });
}

export const loggerUtil = new LoggerUtil();
