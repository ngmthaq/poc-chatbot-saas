import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AgentDispatchClient } from 'livekit-server-sdk';

import { LiveKitConfig } from './livekit.config';
import { LIVEKIT_AGENT_DISPATCH_CLIENT } from './livekit.tokens';

import type { AgentDispatch } from '@livekit/protocol';

@Injectable()
export class LiveKitDispatchService {
  private readonly logger = new Logger(LiveKitDispatchService.name);

  constructor(
    @Inject(LIVEKIT_AGENT_DISPATCH_CLIENT)
    private readonly client: AgentDispatchClient,
    private readonly config: LiveKitConfig,
  ) {}

  async createDispatch(
    roomName: string,
    agentName?: string,
    metadata?: string,
  ): Promise<AgentDispatch> {
    const effectiveAgentName = agentName ?? this.config.agentName;
    const ctx = { roomName, agentName: effectiveAgentName };
    try {
      const dispatch = await this.client.createDispatch(
        roomName,
        effectiveAgentName,
        metadata !== undefined ? { metadata } : undefined,
      );
      this.logger.log(
        `createDispatch ok ${JSON.stringify({ ...ctx, dispatchId: dispatch.id })}`,
      );
      return dispatch;
    } catch (err) {
      this.logger.error(
        `createDispatch failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit createDispatch failed');
    }
  }

  async listDispatch(roomName: string): Promise<AgentDispatch[]> {
    const ctx = { roomName };
    try {
      const dispatches = await this.client.listDispatch(roomName);
      this.logger.log(
        `listDispatch ok ${JSON.stringify({ ...ctx, count: dispatches.length })}`,
      );
      return dispatches;
    } catch (err) {
      this.logger.error(
        `listDispatch failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit listDispatch failed');
    }
  }

  async getDispatch(
    dispatchId: string,
    roomName: string,
  ): Promise<AgentDispatch | undefined> {
    const ctx = { dispatchId, roomName };
    try {
      const dispatch = await this.client.getDispatch(dispatchId, roomName);
      this.logger.log(
        `getDispatch ok ${JSON.stringify({ ...ctx, found: dispatch !== undefined })}`,
      );
      return dispatch;
    } catch (err) {
      this.logger.error(
        `getDispatch failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit getDispatch failed');
    }
  }

  async deleteDispatch(dispatchId: string, roomName: string): Promise<void> {
    const ctx = { dispatchId, roomName };
    try {
      await this.client.deleteDispatch(dispatchId, roomName);
      this.logger.log(`deleteDispatch ok ${JSON.stringify(ctx)}`);
    } catch (err) {
      this.logger.error(
        `deleteDispatch failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit deleteDispatch failed');
    }
  }
}
