import { WebhookEvent, WebhookReceiver } from 'livekit-server-sdk';
import { config } from '../config/env';
import { livekitRoomUtil } from '../utils/livekit-room';

export class WebhookService {
  private readonly receiver: WebhookReceiver;

  constructor() {
    this.receiver = new WebhookReceiver(config.livekit.apiKey, config.livekit.apiSecret);
  }

  public async receive(rawBody: string, authHeader: string | null): Promise<void> {
    const event = await this.receiver.receive(rawBody, authHeader ?? undefined);
    switch (event.event) {
      case 'room_finished': {
        await this.handleRoomFinished(event);
        break;
      }
    }
  }

  private async handleRoomFinished(event: WebhookEvent): Promise<void> {
    const roomName = event.room?.name;
    if (!roomName) return;
    await livekitRoomUtil.deleteRoom(roomName);
  }
}

export const webhookService = new WebhookService();
