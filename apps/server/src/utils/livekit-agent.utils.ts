import { AgentDispatchClient } from 'livekit-server-sdk';
import { loadEnv } from '../configs';

export class LiveKitAgentUtil {
  private readonly config = loadEnv();
  private readonly agentDispatchClient = new AgentDispatchClient(
    this.config.LIVEKIT_URL,
    this.config.LIVEKIT_API_KEY,
    this.config.LIVEKIT_API_SECRET,
  );

  public async dispatchAgent(roomName: string) {
    await this.agentDispatchClient.createDispatch(
      roomName,
      this.config.LIVEKIT_AGENT_NAME,
    );
  }
}

export const liveKitAgentUtil = new LiveKitAgentUtil();
