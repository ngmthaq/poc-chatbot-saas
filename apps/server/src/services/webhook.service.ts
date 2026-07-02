import { WebhookEvent, WebhookReceiver } from 'livekit-server-sdk';
import { loadEnv } from '../configs';
import { liveKitRoomUtil, loggerUtil } from '../utils';

export class WebhookService {
  private readonly config = loadEnv();
  private readonly receiver = new WebhookReceiver(
    this.config.LIVEKIT_API_KEY,
    this.config.LIVEKIT_API_SECRET,
  );

  public async receive(
    rawBody: string,
    authHeader: string | null,
  ): Promise<void> {
    const event = await this.receiver.receive(rawBody, authHeader ?? undefined);
    loggerUtil.instance.info(
      { event: event.event, room: event.room?.name },
      'Received webhook event',
    );
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
    await liveKitRoomUtil.deleteRoom(roomName);
  }
}

export const webhookService = new WebhookService();
