import type { RequestHandler } from 'express';
import { liveKitService } from '../services';
import type { GetLiveKitTokenBody } from '../validators';

export class LiveKitController {
  public readonly getToken: RequestHandler = async (req, res) => {
    const response = await liveKitService.getToken(
      req.body as GetLiveKitTokenBody,
    );
    // Send the response back to the client using res.send() instead of returning it
    // since we're using responseHandler to handle the response formatting.
    // see - https://docs.livekit.io/frontends/build/authentication/endpoint/
    res.status(201).send(response);
  };
}

export const livekitController = new LiveKitController();
