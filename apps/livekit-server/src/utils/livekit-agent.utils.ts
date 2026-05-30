import { AgentDispatchClient } from 'livekit-server-sdk';
import { loadConfig } from '../config/env';

export class LiveKitAgentUtil {
  private readonly config = loadConfig();
  private readonly agentDispatchClient = new AgentDispatchClient(
    this.config.livekit.url,
    this.config.livekit.apiKey,
    this.config.livekit.apiSecret,
  );

  public async dispatchAgent(roomName: string) {
    await this.agentDispatchClient.createDispatch(
      roomName,
      this.config.livekit.agentName,
    );
  }
}
