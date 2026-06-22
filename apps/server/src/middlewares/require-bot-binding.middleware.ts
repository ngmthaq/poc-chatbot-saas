import type { Request, RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { errorMessages } from '../configs';
import { ApiKeyService } from '../services/api-key.service';

const apiKeyService = new ApiKeyService();

/**
 * Enforces that the authenticated key may act on the bot targeted by the
 * request, delegating the decision to `ApiKeyService.resolveBotBinding`.
 *
 * `getBotId` is an accessor so the middleware stays decoupled from where the
 * target bot lives; its `undefined` result is normalised to `null` before the
 * binding is resolved.
 *
 * Fail-closed: when `req.context` is absent (e.g. this runs without
 * `apiKeyAuth` ahead of it) the request is rejected with a 401. On a binding
 * violation a 403 is returned. Both messages are generic so they never reveal
 * which bot was targeted or why access was denied. On success the resolved bot
 * is recorded on `req.context.effectiveBotId`. Must be mounted after
 * `apiKeyAuth`.
 */
export function requireBotBinding(
  getBotId: (req: Request) => string | null | undefined,
): RequestHandler {
  return (req, _res, next) => {
    if (req.context === undefined) {
      return next(createHttpError(401, errorMessages.unauthorized()));
    }

    const requestedBotId = getBotId(req) ?? null;
    const { allowed, effectiveBotId } = apiKeyService.resolveBotBinding(
      req.context.botId,
      requestedBotId,
    );

    if (!allowed) {
      return next(createHttpError(403, errorMessages.forbidden()));
    }

    req.context.effectiveBotId = effectiveBotId;

    return next();
  };
}
