import type { RequestHandler } from 'express';
import { configService } from '../services';

export class ConfigController {
  public readonly getConfig: RequestHandler = () => {
    return configService.getPublicConfig();
  };
}

export const configController = new ConfigController();
