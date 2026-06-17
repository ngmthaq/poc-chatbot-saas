import type { RequestHandler } from 'express';
import { ConfigService } from '../services/config.service';

export class ConfigController {
  private readonly configService = new ConfigService();

  public readonly getConfig: RequestHandler = () => {
    return this.configService.getPublicConfig();
  };
}
