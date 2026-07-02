import createHttpError from 'http-errors';
import humps from 'humps';
import { RoomAgentDispatch, RoomConfiguration } from 'livekit-server-sdk';
import { randomUUID } from 'node:crypto';
import { errorMessages, loadEnv } from '../configs';
import { liveKitTokenUtil } from '../utils';
import type { GetLiveKitTokenBody } from '../validators';

export class LiveKitService {
  private readonly config = loadEnv();

  public async getToken(body: GetLiveKitTokenBody) {
    if (!this.config.VOICE_MODE_ENABLED) {
      throw createHttpError(403, errorMessages.voiceModeDisabled());
    }

    const roomName = body.roomName ?? `room-${randomUUID()}`;
    const participantIdentity =
      body.participantIdentity ?? `participant-identity-${randomUUID()}`;
    const participantName =
      body.participantName ?? `participant-name-${randomUUID()}`;
    const participantMetadata =
      body.participantMetadata ?? `participant-metadata-${randomUUID()}`;
    const participantAttributes = body.participantAttributes ?? {};

    const at = liveKitTokenUtil.createAccessToken({
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
            agentName: this.config.LIVEKIT_AGENT_NAME,
          }),
        ],
      });
    }

    const token = await at.toJwt();

    return humps.decamelizeKeys({
      serverUrl: this.config.LIVEKIT_URL,
      participantToken: token,
      participantName: participantName,
      roomName: roomName,
    });
  }
}

export const liveKitService = new LiveKitService();
