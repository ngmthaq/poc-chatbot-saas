- From: planner
- To: Root Agent
- Title: Plan Response — LiveKit Global Module Hardening + Standalone agent-worker Scaffold
- Description: Close gaps in the existing backend-service LiveKit global module (config typing, missing AgentDispatch/Egress/Ingress SDK clients, event typing, JSON-only webhook routing, no tests) and scaffold a sibling agent-worker/ Node package that registers a no-op @livekit/agents-js worker with explicit dispatch by agentName, so future business modules can implement inbound/outbound PSTN, web/mobile WebRTC, and human handoff via a clean global service surface.

---

## Approach Summary

- The backend-service already contains a partial LiveKit global module (LiveKitTokenService, LiveKitRoomService, LiveKitSipService, LiveKitWebhookController) registered in GlobalModule. This plan is strictly a delta over that code: it refactors the SDK-client construction into a single typed config-backed provider layer, adds the two missing SDK clients (AgentDispatchClient, EgressClient, IngressClient) the user explicitly selected, hardens the webhook controller (typed event names, route from env, defence-in-depth), and adds participant-grant helpers needed for caller / AI agent / supervisor identities.
- A new top-level sibling package agent-worker/ is scaffolded as a standalone Node + TypeScript project (its own package.json / tsconfig / .env.example) that boots @livekit/agents-js with a placeholder entrypoint registered against agentName (explicit dispatch). It logs participant join/leave through a Pino logger and exits cleanly on SIGTERM. No STT/TTS/LLM provider wiring is added.
- Abstractions are shaped so future business modules can call a single LiveKitDispatchService (added in this iteration) for inbound-SIP (after caller hits the dispatch rule, backend optionally creates an explicit dispatch), outbound-PSTN (LiveKitSipService.createSipParticipant + LiveKitDispatchService.createDispatch), pure-WebRTC (LiveKitTokenService.createParticipantToken + optional dispatch), and supervisor handoff (LiveKitTokenService.createSupervisorToken with hidden/can_publish grants targeting the same room).
- Code-First testing: every modified/added service in backend-service gets a co-located *.spec.ts using ts-jest (already configured at backend-service/package.json). The agent-worker package adds its own jest config and a single smoke test that asserts the worker module exports a valid entrypoint object without launching a real worker — satisfying the livekit-agents skill testability requirement without external creds.

## Functional Requirements

- Given valid LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET in env, the LiveKitConfig provider returns a typed, validated config object; missing or malformed values fail boot via the existing Joi schema (no silent ?? '' fallbacks in services).
- LiveKitTokenService.createAccessToken mints a JWT whose decoded payload contains the requested identity, room, TTL, and grants; new helpers createCallerToken, createAgentToken, createSupervisorToken produce role-specific grant sets (caller: can_publish/can_subscribe, agent: agent=true + can_publish_data, supervisor: can_publish/can_subscribe + canUpdateOwnMetadata, optionally hidden=true on join).
- LiveKitRoomService, LiveKitSipService, and the two new LiveKitEgressService and LiveKitIngressService classes each accept their underlying client via DI (a single LIVEKIT_CLIENTS provider creates them once from typed config) so they can be mocked in unit tests.
- LiveKitDispatchService.createDispatch(roomName, agentName, metadata?) wraps AgentDispatchClient.createDispatch and is the only place backend code calls the agent dispatch API; listDispatch/getDispatch/deleteDispatch are exposed for future business logic.
- LiveKitWebhookController validates the Authorization header via WebhookReceiver.receive(body, auth) (signature failure -> 401), is mounted at the path from LIVEKIT_WEBHOOK_PATH (currently 'livekit/webhook', defaulted in Joi), accepts only application/webhook+json and application/json, emits typed events on the EventEmitter2 bus using LIVEKIT_EVENT_PREFIX with the SDK's WebhookEventNames union as the event name.
- The new agent-worker package boots a worker via @livekit/agents-js cli.runApp (or equivalent entry from the SDK), reads LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET / AGENT_NAME from process env, registers an entrypoint that logs job acceptance, participant_joined, participant_left, and shuts down cleanly on SIGTERM/SIGINT.
- The agent-worker entrypoint uses agentName for explicit dispatch (automatic dispatch disabled), so backend-service is the single place that decides when an agent joins a room.

## Non-Functional Requirements

- No hardcoded LiveKit API keys, API secrets, JWT signing material, or SIP trunk credentials. All values come from env via Joi-validated config (backend-service) or zod/Joi-validated process.env (agent-worker).
- Webhook signature validation is mandatory and non-skippable in production code paths; the controller never calls WebhookReceiver.receive with skipAuth=true.
- All outbound LiveKit SDK calls (room, sip, egress, ingress, agent-dispatch) are wrapped in a try/catch that logs via Pino with request context (room name, identity, dispatch id) before re-throwing as a Nest exception — no silent failures (AGENT_RULES "DON'T allow silent failures").
- Public webhook route is annotated with @Public() (already present) AND @SkipThrottle() (already present), and global JwtAuthGuard is bypassed. Rate-limiting concerns are documented in the controller header comment.
- Agent worker logs participant join/leave at info level and dispatch acceptance at info level via Pino (use the same logger style as backend-service for grep-ability); never logs API secret or token values.
- Services follow existing naming and structure conventions: *.service.ts / *.controller.ts / *.module.ts; DI via constructor; DTOs use class-validator; interfaces live in src/shared/interfaces.
- No business logic in src/modules/ this iteration. The global service surface (LiveKitTokenService, LiveKitRoomService, LiveKitSipService, LiveKitEgressService, LiveKitIngressService, LiveKitDispatchService, LiveKitWebhookController) is the only contract business modules will call later.

## Files in Scope

backend-service — MODIFY:
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/config/env.validation.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-token.service.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-room.service.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-sip.service.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-webhook.controller.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit.module.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/index.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/shared/constants/livekit.constants.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/shared/interfaces/livekit-token-options.interface.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/shared/interfaces/index.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/.env.example

backend-service — CREATE:
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit.config.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit.tokens.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-egress.service.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-ingress.service.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-dispatch.service.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/shared/interfaces/livekit-event.interface.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit.config.spec.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-token.service.spec.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-room.service.spec.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-sip.service.spec.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-egress.service.spec.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-ingress.service.spec.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-dispatch.service.spec.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/livekit/livekit-webhook.controller.spec.ts

agent-worker (new sibling app) — CREATE:
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/package.json
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/tsconfig.json
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/jest.config.cjs
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/.env.example
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/.gitignore
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/.eslintrc.cjs
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/.prettierrc
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/README.md
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/src/config.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/src/logger.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/src/agent.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/src/main.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/src/agent.spec.ts
- /Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/src/config.spec.ts

DELETE: none.

## Risks & Assumptions

- Assumption (confirmed by user): agent-worker is a standalone Node package at workspace root, not a monorepo (no yarn workspaces, no apps/ folder). It owns its own package.json and node_modules.
- Assumption: agent-worker connects to ../livekit-server by default in dev (LIVEKIT_URL=ws://localhost:7880), but is env-driven so it can target LiveKit Cloud in production.
- Assumption: explicit dispatch (AGENT_NAME set, AgentDispatchClient.createDispatch called from backend-service) is the canonical control-plane flow. Automatic dispatch is intentionally disabled.
- Assumption: the webhook controller path stays at 'livekit/webhook'. Boot-time assertion catches drift between LIVEKIT_WEBHOOK_PATH and the @Controller() decorator path.
- Risk: @livekit/agents-js Node SDK is fast-evolving. The worker scaffold must verify entrypoint export shape against the installed version's d.ts before wiring.
- Risk: LiveKitEgressService and LiveKitIngressService are added now even though no business module uses them yet. Kept as thin pass-throughs to avoid speculative API design.
- Risk: introducing LIVEKIT_AGENT_NAME with default 'voice-agent' changes prod behaviour if an operator was previously relying on automatic dispatch. Mitigated by .env.example documentation.

## Open Questions / Blockers

- None. Codebase inspection answered every open question.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                              | Responsible Role | Dependencies | Skills                                |
| --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------------------------------- |
| 1   | DONE   | Add LIVEKIT_AGENT_NAME to backend-service/src/global/config/env.validation.ts (Joi string, default 'voice-agent') and to backend-service/.env.example                              | developer        | none         | `clean-code`, `secret-scanner`         |
| 2   | DONE   | Create backend-service/src/global/livekit/livekit.config.ts exposing a frozen, typed LiveKitConfig built from ConfigService                                                        | developer        | 1            | `clean-code`, `secret-scanner`         |
| 3   | DONE   | Write spec backend-service/src/global/livekit/livekit.config.spec.ts (valid env -> populated config; missing keys -> throws)                                                       | tester           | 2            | `aaa-testing`                         |
| 4   | DONE   | Create backend-service/src/global/livekit/livekit.tokens.ts with DI tokens + Nest factory Providers for RoomServiceClient, SipClient, EgressClient, IngressClient, AgentDispatchClient | developer        | 2            | `clean-code`, `secret-scanner`         |
| 5   | DONE   | Refactor backend-service/src/global/livekit/livekit-room.service.ts to consume LIVEKIT_ROOM_CLIENT via DI; add Pino log on create/delete/removeParticipant                          | developer        | 4            | `clean-code`                          |
| 6   | DONE   | Write spec backend-service/src/global/livekit/livekit-room.service.spec.ts asserting each method delegates to a mocked RoomServiceClient with correct args                         | tester           | 5            | `aaa-testing`                         |
| 7   | DONE   | Refactor backend-service/src/global/livekit/livekit-sip.service.ts to consume LIVEKIT_SIP_CLIENT and LiveKitConfig via DI                                                          | developer        | 4            | `clean-code`, `security-scanner`       |
| 8   | DONE   | Write spec backend-service/src/global/livekit/livekit-sip.service.spec.ts incl. trunk-id fallback path and BadRequestException path                                                | tester           | 7            | `aaa-testing`                         |
| 9   | DONE   | Add LiveKitCallerTokenOptions / LiveKitAgentTokenOptions / LiveKitSupervisorTokenOptions and re-export                                                                              | developer        | 1            | `clean-code`                          |
| 10  | DONE   | Refactor livekit-token.service.ts to use LiveKitConfig and add createCallerToken/createAgentToken/createSupervisorToken                                                             | developer        | 2, 9         | `clean-code`, `security-scanner`       |
| 11  | DONE   | Write spec livekit-token.service.spec.ts decoding minted JWTs and asserting grants/TTL/identity per role                                                                            | tester           | 10           | `aaa-testing`                         |
| 12  | DONE   | Create livekit-egress.service.ts as thin EgressClient pass-through                                                                                                                 | developer        | 4            | `clean-code`                          |
| 13  | DONE   | Spec livekit-egress.service.spec.ts                                                                                                                                                | tester           | 12           | `aaa-testing`                         |
| 14  | DONE   | Create livekit-ingress.service.ts as thin IngressClient pass-through                                                                                                               | developer        | 4            | `clean-code`                          |
| 15  | DONE   | Spec livekit-ingress.service.spec.ts                                                                                                                                               | tester           | 14           | `aaa-testing`                         |
| 16  | DONE   | Create livekit-dispatch.service.ts wrapping AgentDispatchClient                                                                                                                    | developer        | 4            | `clean-code`, `livekit-agents`         |
| 17  | DONE   | Spec livekit-dispatch.service.spec.ts                                                                                                                                              | tester           | 16           | `aaa-testing`                         |
| 18  | DONE   | Add livekit-event.interface.ts + extend livekit.constants.ts (WebhookEventNames tuple + identity prefixes)                                                                          | developer        | 1            | `clean-code`                          |
| 19  | DONE   | Harden livekit-webhook.controller.ts (415 on bad content-type; warn-log signature failure; typed events; path-drift assertion)                                                     | developer        | 18           | `clean-code`, `security-scanner`       |
| 20  | DONE   | Spec livekit-webhook.controller.spec.ts (200/401/415 + emit)                                                                                                                       | tester           | 19           | `aaa-testing`, `security-scanner`      |
| 21  | DONE   | Update livekit.module.ts to register new providers; update index.ts re-exports                                                                                                     | developer        | 2,4,5,7,10,12,14,16,19 | `clean-code`                |
| 22  | DONE   | Create agent-worker/ skeleton (package.json, tsconfig, jest, eslint, prettier, gitignore, .env.example, README)                                                                    | developer        | none         | `clean-code`, `livekit-agents`, `secret-scanner` |
| 23  | DONE   | Create agent-worker/src/config.ts + logger.ts                                                                                                                                      | developer        | 22           | `clean-code`, `secret-scanner`         |
| 24  | DONE   | Spec agent-worker/src/config.spec.ts                                                                                                                                               | tester           | 23           | `aaa-testing`                         |
| 25  | DONE   | Create agent-worker/src/agent.ts (no-op entrypoint logging participant_joined/left)                                                                                                | developer        | 23           | `clean-code`, `livekit-agents`         |
| 26  | DONE   | Create agent-worker/src/main.ts (Worker bootstrap; SIGTERM/SIGINT graceful close)                                                                                                  | developer        | 25           | `clean-code`, `livekit-agents`         |
| 27  | DONE   | Spec agent-worker/src/agent.spec.ts                                                                                                                                                | tester           | 25           | `aaa-testing`, `livekit-agents`        |

---

## Reviewer Decision

`accepted` — 90/90 backend tests pass. No critical or high findings. Two medium and four low findings recorded as recommendations (see Final Summary in conversation).
