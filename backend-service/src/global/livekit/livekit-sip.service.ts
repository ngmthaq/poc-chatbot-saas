import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  CreateSipDispatchRuleOptions,
  CreateSipInboundTrunkOptions,
  CreateSipOutboundTrunkOptions,
  ListSipDispatchRuleOptions,
  ListSipTrunkOptions,
  SIPDispatchRuleInfo,
  SIPInboundTrunkInfo,
  SIPOutboundTrunkInfo,
  SIPParticipantInfo,
  SipClient,
  SipDispatchRuleDirect,
  SipDispatchRuleIndividual,
} from 'livekit-server-sdk';

import { LiveKitConfig } from './livekit.config';
import { LIVEKIT_SIP_CLIENT } from './livekit.tokens';

import type { LiveKitCreateSipParticipantOptions } from '../../shared/interfaces';

@Injectable()
export class LiveKitSipService {
  private readonly logger = new Logger(LiveKitSipService.name);

  constructor(
    @Inject(LIVEKIT_SIP_CLIENT) private readonly client: SipClient,
    private readonly config: LiveKitConfig,
  ) {}

  async createSipInboundTrunk(
    name: string,
    numbers: string[],
    options?: CreateSipInboundTrunkOptions,
  ): Promise<SIPInboundTrunkInfo> {
    const ctx = { trunkName: name, numberCount: numbers.length };
    try {
      const trunk = await this.client.createSipInboundTrunk(
        name,
        numbers,
        options,
      );
      this.logger.log(
        `createSipInboundTrunk ok ${JSON.stringify({ ...ctx, sipTrunkId: trunk.sipTrunkId })}`,
      );
      return trunk;
    } catch (err) {
      this.logger.error(
        `createSipInboundTrunk failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit createSipInboundTrunk failed',
      );
    }
  }

  async createSipOutboundTrunk(
    name: string,
    address: string,
    numbers: string[],
    options?: CreateSipOutboundTrunkOptions,
  ): Promise<SIPOutboundTrunkInfo> {
    const ctx = { trunkName: name, address, numberCount: numbers.length };
    try {
      const trunk = await this.client.createSipOutboundTrunk(
        name,
        address,
        numbers,
        options,
      );
      this.logger.log(
        `createSipOutboundTrunk ok ${JSON.stringify({ ...ctx, sipTrunkId: trunk.sipTrunkId })}`,
      );
      return trunk;
    } catch (err) {
      this.logger.error(
        `createSipOutboundTrunk failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit createSipOutboundTrunk failed',
      );
    }
  }

  async listSipInboundTrunk(
    options?: ListSipTrunkOptions,
  ): Promise<SIPInboundTrunkInfo[]> {
    try {
      const trunks = await this.client.listSipInboundTrunk(options);
      this.logger.log(
        `listSipInboundTrunk ok ${JSON.stringify({ count: trunks.length })}`,
      );
      return trunks;
    } catch (err) {
      this.logger.error(
        'listSipInboundTrunk failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit listSipInboundTrunk failed',
      );
    }
  }

  async listSipOutboundTrunk(
    options?: ListSipTrunkOptions,
  ): Promise<SIPOutboundTrunkInfo[]> {
    try {
      const trunks = await this.client.listSipOutboundTrunk(options);
      this.logger.log(
        `listSipOutboundTrunk ok ${JSON.stringify({ count: trunks.length })}`,
      );
      return trunks;
    } catch (err) {
      this.logger.error(
        'listSipOutboundTrunk failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit listSipOutboundTrunk failed',
      );
    }
  }

  async deleteSipTrunk(sipTrunkId: string): Promise<void> {
    const ctx = { sipTrunkId };
    try {
      await this.client.deleteSipTrunk(sipTrunkId);
      this.logger.log(`deleteSipTrunk ok ${JSON.stringify(ctx)}`);
    } catch (err) {
      this.logger.error(
        `deleteSipTrunk failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('LiveKit deleteSipTrunk failed');
    }
  }

  async createSipDispatchRule(
    rule: SipDispatchRuleDirect | SipDispatchRuleIndividual,
    options?: CreateSipDispatchRuleOptions,
  ): Promise<SIPDispatchRuleInfo> {
    const ctx = { ruleName: options?.name };
    try {
      const dispatchRule = await this.client.createSipDispatchRule(
        rule,
        options,
      );
      this.logger.log(
        `createSipDispatchRule ok ${JSON.stringify({ ...ctx, sipDispatchRuleId: dispatchRule.sipDispatchRuleId })}`,
      );
      return dispatchRule;
    } catch (err) {
      this.logger.error(
        `createSipDispatchRule failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit createSipDispatchRule failed',
      );
    }
  }

  async listSipDispatchRule(
    options?: ListSipDispatchRuleOptions,
  ): Promise<SIPDispatchRuleInfo[]> {
    try {
      const rules = await this.client.listSipDispatchRule(options);
      this.logger.log(
        `listSipDispatchRule ok ${JSON.stringify({ count: rules.length })}`,
      );
      return rules;
    } catch (err) {
      this.logger.error(
        'listSipDispatchRule failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit listSipDispatchRule failed',
      );
    }
  }

  async deleteSipDispatchRule(
    sipDispatchRuleId: string,
  ): Promise<SIPDispatchRuleInfo> {
    const ctx = { sipDispatchRuleId };
    try {
      const rule = await this.client.deleteSipDispatchRule(sipDispatchRuleId);
      this.logger.log(`deleteSipDispatchRule ok ${JSON.stringify(ctx)}`);
      return rule;
    } catch (err) {
      this.logger.error(
        `deleteSipDispatchRule failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit deleteSipDispatchRule failed',
      );
    }
  }

  async createSipParticipant(
    options: LiveKitCreateSipParticipantOptions,
  ): Promise<SIPParticipantInfo> {
    const trunkId = options.trunkId ?? this.config.sipTrunkId;
    if (!trunkId) {
      throw new BadRequestException('LiveKit SIP trunk id missing');
    }

    const ctx = {
      roomName: options.roomName,
      participantIdentity: options.participantIdentity,
      sipCallTo: options.sipCallTo,
    };
    try {
      const participant = await this.client.createSipParticipant(
        trunkId,
        options.sipCallTo,
        options.roomName,
        {
          participantIdentity: options.participantIdentity,
          participantName: options.participantName,
          krispEnabled: options.krispEnabled,
        },
      );
      this.logger.log(
        `createSipParticipant ok ${JSON.stringify({ ...ctx, sipCallId: participant.sipCallId })}`,
      );
      return participant;
    } catch (err) {
      this.logger.error(
        `createSipParticipant failed ${JSON.stringify(ctx)}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException(
        'LiveKit createSipParticipant failed',
      );
    }
  }
}
