import { WebhookEvent, WebhookReceiver } from 'livekit-server-sdk';
import { loadConfig } from '../config/env';
import { LiveKitRoomUtil } from '../utils/livekit-room';

export class WebhookService {
  private readonly config = loadConfig();
  private readonly liveKitRoomUtil = new LiveKitRoomUtil();
  private readonly receiver = new WebhookReceiver(
    this.config.livekit.apiKey,
    this.config.livekit.apiSecret,
  );

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
    await this.liveKitRoomUtil.deleteRoom(roomName);
  }
}
