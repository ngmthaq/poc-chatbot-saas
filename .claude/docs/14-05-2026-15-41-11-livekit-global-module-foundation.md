- From: planner
- To: Root Agent
- Title: Plan Response — LiveKit global module + global service (foundation, rev 2)
- Description: Introduce a NestJS LiveKit global module under `src/global/livekit/` with three injectable services (token, room, SIP) plus a webhook controller; relocate all sharable artefacts (constants + interfaces) into `src/shared/constants/` and `src/shared/interfaces/` to honour the established flat-barrel conventions.
- **Final Status:** ACCEPTED by reviewer on 2026-05-14. All 17 tasks `DONE`. See [Implementation Notes (as-built)](#implementation-notes-as-built) at the end of this document for deviations from the original plan that surfaced during execution.

---

## Approach Summary

- Mirror the existing global-module pattern (e.g. `cache`, `http`, `event`) by creating `src/global/livekit/` containing `livekit.module.ts`, three feature services, a webhook controller, and a local barrel `index.ts` that exports only module + services.
- Relocate cross-cutting artefacts per user revision-2 instructions: `LIVEKIT_*` constants live in `src/shared/constants/livekit.constants.ts`; token + SIP option interfaces live in `src/shared/interfaces/livekit-*.interface.ts`, both surfaced via append-only edits to the existing `index.ts` barrels. No local `interfaces/` or `constants.ts` is kept inside `global/livekit/`.
- Extend the existing Joi schema in `global/config/env.validation.ts` with six new `LIVEKIT_*` keys (URL, API key/secret, webhook path, SIP trunk id, default token TTL) and mirror them in `.env.example`. The webhook controller path is the static literal `'livekit/webhook'`; the `LIVEKIT_WEBHOOK_PATH` env var stays as ops source-of-truth only.
- Wire `LiveKitModule` into the `GlobalModule` imports/exports array, re-export from `global/index.ts`, and enable `rawBody: true` in `main.ts` for future webhook signature verification.
- npm package is the unscoped `livekit-server-sdk` (locked to `^2`, installed 2.15.3 at build time); the scoped `@livekit/server-sdk` referenced earlier in planning does not exist on the registry.

## Functional Requirements

- `LiveKitModule` is registered as a global module via `GlobalModule` and is importable across the app without re-declaration.
- `LiveKitTokenService.createAccessToken(options)` returns a signed JWT using `livekit-server-sdk` `AccessToken`, accepting `{ identity, name?, roomName, metadata?, grants?, ttlSeconds? }`; default TTL = 3600 s when `ttlSeconds` is omitted. `grants` is typed as the local `LiveKitVideoGrantOptions` structural type (mirrors `VideoGrant`'s public surface without importing the SDK type — fixes a typescript-eslint resolution cascade that occurred when the interface depended on `Partial<VideoGrant>`).
- `LiveKitRoomService` exposes admin operations (`createRoom`, `listRooms`, `deleteRoom`, `listParticipants`, `getParticipant`, `removeParticipant`, `updateParticipant`, `mutePublishedTrack`) that delegate to `RoomServiceClient` from `livekit-server-sdk`.
- `LiveKitSipService` exposes SIP operations (`createSipInboundTrunk`, `createSipOutboundTrunk`, `listSipInboundTrunk`, `listSipOutboundTrunk`, `deleteSipTrunk`, `createSipDispatchRule`, `listSipDispatchRule`, `deleteSipDispatchRule`, `createSipParticipant`) that delegate to `SipClient` from `livekit-server-sdk`. `createSipParticipant({ trunkId? })` falls back to `LIVEKIT_SIP_TRUNK_ID` from `ConfigService` when `trunkId` is omitted and throws `BadRequestException('LiveKit SIP trunk id missing')` when neither is provided. `deleteSipTrunk` returns `Promise<void>` (discards the SDK's deprecated `SIPTrunkInfo` response).
- `LiveKitWebhookController` is decorated with `@Controller('livekit/webhook')` and exposes a `@Post() @HttpCode(200) @Public() @SkipThrottle()` handler that accepts the raw body, verifies the signature via `WebhookReceiver.receive(rawBody.toString(), authHeader)` from `livekit-server-sdk`, and re-emits each verified event onto `EventEmitter2` under `${LIVEKIT_EVENT_PREFIX}.${event.event}` (e.g. `livekit.room_started`). Final HTTP URL is `${API_PREFIX}/livekit/webhook`. Unsigned/invalid bodies surface as `UnauthorizedException('Invalid LiveKit webhook signature')`; the auth header, raw body, and `LIVEKIT_API_SECRET` are never logged. The controller logs only `event.event` and `event.room?.name`.
- Six `LIVEKIT_*` env vars are validated by Joi at bootstrap; required keys must fail-fast.
- `livekit-server-sdk` (unscoped package name) is added to `dependencies` as `^2` (caret; locked at 2.15.3 in `yarn.lock`).
- Consumers can import the three services + `LiveKitModule` from `src/global/livekit` (via its barrel) and import option interfaces + constants from `src/shared/interfaces` and `src/shared/constants` respectively.

## Non-Functional Requirements

- Match existing flat-barrel conventions: kebab-case filenames, `.constants.ts` / `.interface.ts` / `.service.ts` / `.controller.ts` / `.module.ts` suffixes; append new barrel exports to the end of `index.ts` files preserving current order.
- No path aliases (tsconfig has none) — services and controller import shared artefacts via relative paths (`../../shared/interfaces`, `../../shared/constants`).
- No secrets ever logged; controller logs only the verified event name + room name. Webhook signature verification must reject unsigned/invalid payloads with 401.
- Follow `clean-code`: each service has a single responsibility; one lazy-initialised SDK client per service (created in constructor from `ConfigService`).
- Follow `secret-scanner`: `.env.example` keys only — no real values committed.
- `rawBody: true` enabled at `NestFactory.create` so the webhook controller can access the unmodified body for signature verification.
- Plan is foundation-only — no business logic, no tests (deferred per user).

## Files in Scope

Created:

- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit.module.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-token.service.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-room.service.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-sip.service.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-webhook.controller.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/index.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/shared/constants/livekit.constants.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/shared/interfaces/livekit-token-options.interface.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/shared/interfaces/livekit-sip-options.interface.ts`

Modified:

- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/global.module.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/index.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/config/env.validation.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/.env.example`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/main.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/shared/constants/index.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/shared/interfaces/index.ts`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/package.json`

Deleted: none.

## Risks & Assumptions

- Assumption: `@livekit/server-sdk` `^2.x` runs on Node + NestJS 11 + TS `module: nodenext` without ESM interop fixes; if it ships ESM-only and breaks `require`, switching the import style or pinning to a CJS-compatible minor may be required during execution.
- Assumption: `EventEmitter2` (already provided by the global `EventModule` via `@nestjs/event-emitter`) is the right bus for re-emitting verified webhook events; downstream business logic will register `@OnEvent('livekit.*')` listeners later.
- Assumption: `WebhookReceiver.receive()` accepts the request raw body (`Buffer` or `string`) and the `Authorization` header verbatim; matches LiveKit's documented usage.
- Assumption: ops will configure LiveKit's webhook destination using the final URL `${API_PREFIX}/livekit/webhook` — this is mirrored by `LIVEKIT_WEBHOOK_PATH` in `.env` as documentation only; runtime path stays static.
- Risk: enabling `rawBody: true` globally is safe (NestExpress preserves parsed body alongside raw), but any other module relying on raw streams should be verified during execution — current scan shows none.
- Risk: relocating interfaces/constants to `shared/` adds two-step append edits to existing barrels — order matters; developer must append (not prepend) to keep diff minimal.

## Open Questions / Blockers

- None. All 7 prior open questions are resolved by the user. No new ambiguity surfaced during re-planning.

## Status

- [x] Ready to execute
- [x] Executed and ACCEPTED by reviewer (2026-05-14) — `yarn build` and `npx eslint --max-warnings 0` both exit 0.
- [ ] Blocked — requires user input on: n/a

## Task List

| #   | Status | Task | Responsible Role | Dependencies | Skills |
| --- | ------ | ---- | ---------------- | ------------ | ------ |
| 1   | DONE   | Add `"livekit-server-sdk": "^2"` to `dependencies` in `backend-service/package.json` and run `yarn add`. **As-built:** package name corrected from `@livekit/server-sdk` (does not exist on npm) to unscoped `livekit-server-sdk`; locked at 2.15.3 in `yarn.lock`. | developer | none | `clean-code` |
| 2   | DONE   | Create `backend-service/src/shared/constants/livekit.constants.ts` exporting: `LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS = 3600`, `LIVEKIT_EVENT_PREFIX = 'livekit' as const`, `LIVEKIT_WEBHOOK_ROUTE = 'livekit/webhook' as const`. | developer | none | `clean-code` |
| 3   | DONE   | Append `export * from './livekit.constants';` as the final line of `backend-service/src/shared/constants/index.ts` (preserve current 5 lines and order). | developer | task 2 | `clean-code` |
| 4   | DONE   | Create `backend-service/src/shared/interfaces/livekit-token-options.interface.ts`. **As-built:** the interface declares a **self-contained** `LiveKitVideoGrantOptions` structural type (mirroring `VideoGrant`'s public surface) instead of `Partial<VideoGrant>`. The file imports nothing from `livekit-server-sdk` — this avoids a typescript-eslint resolution cascade caused by the SDK's dual ESM/CJS conditional exports. | developer | task 1 | `clean-code` |
| 5   | DONE   | Create `backend-service/src/shared/interfaces/livekit-sip-options.interface.ts` exporting `LiveKitCreateSipParticipantOptions { trunkId?: string; sipCallTo: string; roomName: string; participantIdentity: string; participantName?: string; krispEnabled?: boolean }`. **As-built:** the speculative `export type { ... } from 'livekit-server-sdk'` re-export block originally planned was removed — service files import SDK option types directly. | developer | task 1 | `clean-code` |
| 6   | DONE   | Append two lines (`export * from './livekit-token-options.interface';` then `export * from './livekit-sip-options.interface';`) at end of `backend-service/src/shared/interfaces/index.ts`. | developer | tasks 4,5 | `clean-code` |
| 7   | DONE   | Extend `backend-service/src/global/config/env.validation.ts` Joi schema with: `LIVEKIT_URL: Joi.string().pattern(/^(wss?\|https?):\/\//).required()`, `LIVEKIT_API_KEY: Joi.string().required()`, `LIVEKIT_API_SECRET: Joi.string().min(16).required()`, `LIVEKIT_WEBHOOK_PATH: Joi.string().default('livekit/webhook')`, `LIVEKIT_SIP_TRUNK_ID: Joi.string().allow('').optional()`, `LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS: Joi.number().integer().min(60).default(3600)`. | developer | none | `clean-code`, `secret-scanner` |
| 8   | DONE   | Mirror the six new `LIVEKIT_*` keys in `backend-service/.env.example` under a new `# LiveKit` section appended after the AWS S3 block, values left blank (per repo convention). | developer | task 7 | `secret-scanner` |
| 9   | DONE   | Create `backend-service/src/global/livekit/livekit-token.service.ts`: `@Injectable()` class injecting `ConfigService`; `createAccessToken(options: LiveKitTokenOptions): Promise<string>` instantiates `AccessToken` from `livekit-server-sdk`, applies `identity` / `name` / `metadata` / `ttl` (defaulting via `config.get<number>('LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS') ?? LIVEKIT_DEFAULT_TOKEN_TTL_SECONDS`), then `token.addGrant({ roomJoin: true, room: options.roomName, ...options.grants })`, returns `await token.toJwt()`. **As-built:** imports `LiveKitTokenOptions` from a direct file path (`'../../shared/interfaces/livekit-token-options.interface'`) bypassing the barrel — required to break the SDK-type resolution cascade. | developer | tasks 1,2,4,6,7 | `clean-code` |
| 10  | DONE   | Create `backend-service/src/global/livekit/livekit-room.service.ts`: `@Injectable()` class instantiating one `RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)` in constructor; expose thin async wrappers `createRoom(opts)`, `listRooms(names?)`, `deleteRoom(name)`, `listParticipants(room)`, `getParticipant(room, identity)`, `removeParticipant(room, identity)`, `updateParticipant(room, identity, opts)`, `mutePublishedTrack(room, identity, trackSid, muted)` delegating to the SDK client. | developer | tasks 1,7 | `clean-code` |
| 11  | DONE   | Create `backend-service/src/global/livekit/livekit-sip.service.ts`: `@Injectable()` class instantiating one `SipClient`; expose `createSipInboundTrunk`, `createSipOutboundTrunk`, `listSipInboundTrunk`, `listSipOutboundTrunk`, `deleteSipTrunk` (returns `Promise<void>` — discards deprecated `SIPTrunkInfo`), `createSipDispatchRule`, `listSipDispatchRule`, `deleteSipDispatchRule`, `createSipParticipant(opts)`. Inside `createSipParticipant`, when `opts.trunkId` is undefined, read `LIVEKIT_SIP_TRUNK_ID` via `ConfigService`; throw `BadRequestException('LiveKit SIP trunk id missing')` if neither is set. **As-built:** SDK method names are singular (`listSipInboundTrunk`, not `listSipInboundTrunks`) — matched verbatim to the installed SDK signature. | developer | tasks 1,5,6,7 | `clean-code` |
| 12  | DONE   | Create `backend-service/src/global/livekit/livekit-webhook.controller.ts`: `@Controller('livekit/webhook')` (static literal) with a single `@Post() @HttpCode(200) @Public() @SkipThrottle()` handler `handleWebhook(@Req() req: RawBodyRequest<Request>, @Headers('authorization') auth)`. Instantiate one `WebhookReceiver(apiKey, apiSecret)` in constructor, call `await receiver.receive(req.rawBody.toString(), auth)`, then `this.eventEmitter.emit(\`${LIVEKIT_EVENT_PREFIX}.${event.event}\`, event)`. Inject `EventEmitter2` and `ConfigService`. On verification failure throw `UnauthorizedException('Invalid LiveKit webhook signature')` — never include the secret/header/body in the error. Logs only `event.event` + `event.room?.name`. | developer | tasks 1,2,3,7 | `clean-code`, `secret-scanner` |
| 13  | DONE   | Create `backend-service/src/global/livekit/livekit.module.ts`: `@Module({ providers: [LiveKitTokenService, LiveKitRoomService, LiveKitSipService], controllers: [LiveKitWebhookController], exports: [LiveKitTokenService, LiveKitRoomService, LiveKitSipService] })`. No imports (ConfigModule + EventModule are global). No `@Global()` decorator. | developer | tasks 9,10,11,12 | `clean-code` |
| 14  | DONE   | Create `backend-service/src/global/livekit/index.ts` barrel exporting `./livekit.module`, `./livekit-token.service`, `./livekit-room.service`, `./livekit-sip.service`, `./livekit-webhook.controller`. No constants/interfaces (those live in shared). | developer | task 13 | `clean-code` |
| 15  | DONE   | Edit `backend-service/src/global/global.module.ts`: added `import { LiveKitModule } from './livekit';` and appended `LiveKitModule` to the `modules` array. | developer | tasks 13,14 | `clean-code` |
| 16  | DONE   | Append `export * from './livekit';` to `backend-service/src/global/index.ts`. | developer | task 14 | `clean-code` |
| 17  | DONE   | Edit `backend-service/src/main.ts`: added `rawBody: true` to the `NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true, rawBody: true })` options. No other main.ts edits. | developer | none | `clean-code` |

> **Note:** Task 9 (token service) depends on tasks 1, 2, 4, 6, 7 — meaning SDK install, the constants file, the token-options interface, the interfaces barrel append, and the env schema must all land before token service compiles cleanly. Tasks 1, 2, 4, 5, 7, 17 are otherwise independent and can be parallelised within a single delegation if the developer agent supports it; otherwise execute in numeric order.

> **Note:** Task 15 task list deliberately omits the dropped revision-1 "task 15 — conditional event-prefix centralisation" — that decision is now resolved (event prefix lives in `livekit.constants.ts`, not in `event.constants.ts`).

### Critical Files for Implementation

- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit.module.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-webhook.controller.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/config/env.validation.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/shared/constants/livekit.constants.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/main.ts

---

## Implementation Notes (as-built)

Captured after the developer cycle completed and the reviewer accepted on 2026-05-14. Where the running code diverges from the plan above, this section is authoritative.

### Package name correction

The npm package is **`livekit-server-sdk`** (unscoped), not `@livekit/server-sdk`. The scoped name does not exist on the npm registry — only `@livekit/agents`, `@livekit/rtc-node`, and `@livekit/protocol` are scoped. Installed at `^2`, locked at `2.15.3`.

### Three-pass developer execution

1. **Pass 1** — scaffolded all 17 tasks; build + lint reported green.
2. **Pass 2** — IDE diagnostics surfaced two real defects: (a) `SIPTrunkInfo` is deprecated in the SDK — `deleteSipTrunk` now returns `Promise<void>` and the deprecated response type is no longer imported; (b) a typescript-eslint "type cannot be resolved" cascade on the option interfaces — fixed by switching the consuming services to `import type` and pruning a speculative `export type { ... } from 'livekit-server-sdk'` re-export block from `livekit-sip-options.interface.ts`.
3. **Pass 3** — a residual cascade specific to `LiveKitTokenOptions` (which depended on `Partial<VideoGrant>`) was eliminated by (a) bypassing the `shared/interfaces` barrel in `livekit-token.service.ts` via a direct file import and (b) replacing `Partial<VideoGrant>` with a self-contained local `LiveKitVideoGrantOptions` structural type so the interface file no longer imports any SDK type.

### SDK shape adjustments

- `LiveKitVideoGrantOptions` (in `livekit-token-options.interface.ts`) was verified against `node_modules/livekit-server-sdk/dist/grants.d.ts`. The shape is a strict subset of the SDK's `VideoGrant` — every field is optional, types match, and structural typing satisfies `token.addGrant(grant: VideoGrant)` without nominal coupling. The `canPublishSources` field was intentionally omitted because the SDK types it as `TrackSource[]` (an enum from `@livekit/protocol`) — replicating it would force a cross-package type import and defeat the purpose of the fix. Three forward-compat fields are also present: `canSubscribeMetrics`, `canManageAgentSession`, `destinationRoom`.
- `LiveKitSipService` method names are singular (`listSipInboundTrunk`, `listSipOutboundTrunk`, `listSipDispatchRule`) because that is what the SDK exports. `createSipParticipant` is positional under the hood — `(sipTrunkId, number, roomName, opts?)` — so `LiveKitCreateSipParticipantOptions` is the wrapper-level shape; the service unpacks fields internally.

### typescript-eslint vs `tsc` resolution drift (known quirk)

`tsc` (the build) and `npx eslint --max-warnings 0` both pass cleanly. However, the IDE's diagnostic feed reports stale or mis-parsed "type cannot be resolved" findings against the LiveKit service files even after pass 3, with rule names rendered as `[[object Object]]` (a serialization bug in the reporter). The user reviewed and elected to treat the work as complete based on the CLI tooling being green. **If you see those diagnostics in your IDE on a fresh checkout, run `TypeScript: Restart TS Server` — the project itself is clean.**

The deeper cause: the SDK ships dual ESM/CJS conditional exports (`dist/index.d.ts` for `import`, `dist/index.d.cts` for `require`). `tsc` under `nodenext` + CJS host correctly picks the `.d.cts` path. The typescript-eslint parser used by `parserOptions.projectService: true` sometimes picks the `.d.ts` (ESM) path through certain barrel paths, producing the cascade. The implemented fixes (direct file import, self-contained interface) make the cascade structurally impossible regardless of which conditional export the parser picks.

### Webhook flow (final)

1. `LiveKit-server` POSTs the signed JSON event to `${API_PREFIX}/livekit/webhook` with the signature in the `Authorization` header.
2. `LiveKitWebhookController` (decorated `@Public() @SkipThrottle()`) reads `req.rawBody` (enabled by `rawBody: true` in `main.ts`) and the auth header.
3. `WebhookReceiver.receive(rawBody.toString(), authHeader)` verifies the signature against `LIVEKIT_API_KEY` + `LIVEKIT_API_SECRET`. On mismatch the SDK throws; the controller catches and re-throws as `UnauthorizedException('Invalid LiveKit webhook signature')`.
4. On success, the controller emits `livekit.<event_type>` (e.g. `livekit.room_started`) onto `EventEmitter2`. Future feature modules can subscribe via `@OnEvent('livekit.room_started')` etc.
5. The auth header, raw body, and `LIVEKIT_API_SECRET` are never logged or included in any error message. The controller logs only `event.event` and `event.room?.name`.

### Reviewer recommendation (non-blocking)

Future PRs that expose LiveKit operations via HTTP controllers (rooms, SIP trunks, participant admin) should apply role-based access control (RBAC) before the service-layer call — the service layer is intentionally permission-agnostic at this foundation stage.

### Deferred (not in this PR)

- `@livekit/agents` (agents-js) — separate iteration.
- Business modules under `src/modules/` — foundation only.
- Unit tests for the new module — tester sub-agent was not spawned per user instruction.
- `.env` propagation script between `livekit-server/` and `backend-service/` — ops concern.
