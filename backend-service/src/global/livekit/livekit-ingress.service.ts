import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  IngressClient,
  IngressInfo,
  ListIngressOptions,
} from 'livekit-server-sdk';

import { LIVEKIT_INGRESS_CLIENT } from './livekit.tokens';

import type { LiveKitCreateIngressRequest } from '../../shared/interfaces';

@Injectable()
export class LiveKitIngressService {
  private readonly logger = new Logger(LiveKitIngressService.name);

  constructor(
    @Inject(LIVEKIT_INGRESS_CLIENT) private readonly client: IngressClient,
  ) {}

  async createIngress(req: LiveKitCreateIngressRequest): Promise<IngressInfo> {
    const ctx = {
      inputType: req.inputType,
      roomName: req.options.roomName,
      participantIdentity: req.options.participantIdentity,
    };
    try {
      const info = await this.client.createIngress(req.inputType, req.options);
      this.logger.log(
        `createIngress ok ${JSON.stringify({ ...ctx, ingressId: info.ingressId })}`,
      );
      return info;
    } catch (err) {
      this.logger.error(
        `createIngress failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit createIngress failed');
    }
  }

  async listIngress(roomName?: string): Promise<IngressInfo[]> {
    const ctx = { roomName };
    try {
      const opts: ListIngressOptions | undefined = roomName
        ? { roomName }
        : undefined;
      const infos = await this.client.listIngress(opts);
      this.logger.log(
        `listIngress ok ${JSON.stringify({ ...ctx, count: infos.length })}`,
      );
      return infos;
    } catch (err) {
      this.logger.error(
        `listIngress failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit listIngress failed');
    }
  }

  async deleteIngress(ingressId: string): Promise<IngressInfo> {
    const ctx = { ingressId };
    try {
      const info = await this.client.deleteIngress(ingressId);
      this.logger.log(`deleteIngress ok ${JSON.stringify(ctx)}`);
      return info;
    } catch (err) {
      this.logger.error(
        `deleteIngress failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit deleteIngress failed');
    }
  }
}
