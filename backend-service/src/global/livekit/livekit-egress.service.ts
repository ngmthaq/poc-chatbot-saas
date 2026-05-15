import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  EgressClient,
  EgressInfo,
  ListEgressOptions,
} from 'livekit-server-sdk';

import { LIVEKIT_EGRESS_CLIENT } from './livekit.tokens';

import type { LiveKitStartRoomCompositeEgressRequest } from '../../shared/interfaces';

@Injectable()
export class LiveKitEgressService {
  private readonly logger = new Logger(LiveKitEgressService.name);

  constructor(
    @Inject(LIVEKIT_EGRESS_CLIENT) private readonly client: EgressClient,
  ) {}

  async startRoomCompositeEgress(
    req: LiveKitStartRoomCompositeEgressRequest,
  ): Promise<EgressInfo> {
    const ctx = { roomName: req.roomName };
    try {
      const info = await this.client.startRoomCompositeEgress(
        req.roomName,
        req.output,
        req.options,
      );
      this.logger.log(
        `startRoomCompositeEgress ok ${JSON.stringify({ ...ctx, egressId: info.egressId })}`,
      );
      return info;
    } catch (err) {
      this.logger.error(
        `startRoomCompositeEgress failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit startRoomCompositeEgress failed',
      );
    }
  }

  async stopEgress(egressId: string): Promise<EgressInfo> {
    const ctx = { egressId };
    try {
      const info = await this.client.stopEgress(egressId);
      this.logger.log(`stopEgress ok ${JSON.stringify(ctx)}`);
      return info;
    } catch (err) {
      this.logger.error(
        `stopEgress failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit stopEgress failed');
    }
  }

  async listEgress(roomName?: string): Promise<EgressInfo[]> {
    const ctx = { roomName };
    try {
      const opts: ListEgressOptions | undefined = roomName
        ? { roomName }
        : undefined;
      const infos = await this.client.listEgress(opts);
      this.logger.log(
        `listEgress ok ${JSON.stringify({ ...ctx, count: infos.length })}`,
      );
      return infos;
    } catch (err) {
      this.logger.error(
        `listEgress failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit listEgress failed');
    }
  }
}
