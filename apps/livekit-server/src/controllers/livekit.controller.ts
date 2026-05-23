import type { RequestHandler } from 'express';
import { LiveKitService } from '../services/livekit.service';
import type { GetLiveKitTokenBody } from '../validators/get-livekit-token.validator';

export class LiveKitController {
  private readonly liveKitService = new LiveKitService();

  public readonly getToken: RequestHandler = async (req, res) => {
    const response = await this.liveKitService.getToken(req.body as GetLiveKitTokenBody);
    // Send the response back to the client using res.send() instead of returning it
    // since we're using responseHandler to handle the response formatting.
    // see - https://docs.livekit.io/frontends/build/authentication/endpoint/
    res.status(201).send(response);
  };
}
