export interface GeneratedApiKey {
  raw: string;
  keyHash: string;
  keyPrefix: string;
}

export interface BotBindingResolution {
  allowed: boolean;
  effectiveBotId: string | null;
}
