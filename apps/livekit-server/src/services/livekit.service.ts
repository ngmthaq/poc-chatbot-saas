import humps from 'humps';
import { RoomAgentDispatch, RoomConfiguration } from 'livekit-server-sdk';
import { randomUUID } from 'node:crypto';
import { loadConfig } from '../config/env';
import { LiveKitTokenUtil } from '../utils/livekit-token';
import type { GetLiveKitTokenBody } from '../validators/get-livekit-token.validator';

export class LiveKitService {
  private readonly config = loadConfig();
  private readonly liveKitTokenUtil = new LiveKitTokenUtil();

  public async getToken(body: GetLiveKitTokenBody) {
    const roomName = body.roomName ?? `room-${randomUUID()}`;
    const participantIdentity = body.participantIdentity ?? `participant-identity-${randomUUID()}`;
    const participantName = body.participantName ?? `participant-name-${randomUUID()}`;
    const participantMetadata = body.participantMetadata ?? `participant-metadata-${randomUUID()}`;
    const participantAttributes = body.participantAttributes ?? {};

    const at = this.liveKitTokenUtil.createAccessToken({
      identity: participantIdentity,
      name: participantName,
      metadata: participantMetadata,
      attributes: participantAttributes,
      ttl: '1h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      canUpdateOwnMetadata: true,
    });

    if (body.roomConfig) {
      at.roomConfig = new RoomConfiguration(body.roomConfig);
    } else {
      at.roomConfig = new RoomConfiguration({
        agents: [
          new RoomAgentDispatch({
            agentName: this.config.livekit.agentName,
          }),
        ],
      });
    }

    const token = await at.toJwt();

    return humps.decamelizeKeys({
      serverUrl: this.config.livekit.url,
      participantToken: token,
      participantName: participantName,
      roomName: roomName,
    });
  }
}
