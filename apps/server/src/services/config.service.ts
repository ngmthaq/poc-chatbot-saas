import { loadEnv } from '../configs';

export class ConfigService {
  private readonly config = loadEnv();

  public getPublicConfig() {
    return { voiceModeEnabled: this.config.VOICE_MODE_ENABLED };
  }
}
