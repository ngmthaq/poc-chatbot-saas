# Coding Conventions

> Conventions for the `call-center-agent` pnpm monorepo (TypeScript, ESM, Node >=22).
> Discovered from `.prettierrc`, `eslint.config.ts`, and source under `apps/*` / `packages/*`.

## Project structure

```
call-center-agent/
├── apps/
│   ├── server/          # Express API — layered: routes → controllers → services → utils
│   │   └── src/{configs,controllers,middlewares,routes,services,types,utils,validators}
│   ├── client/          # React 18 + Vite SPA — src/{components,routes,types,...}
│   ├── livekit-agent/   # LiveKit voice agent — src/{...,types}
│   └── infra/           # Docker Compose stack (LiveKit, Postgres, Redis, nginx)
└── packages/
    ├── deepagent/       # LangChain/LangGraph agent (built with tsup)
    └── harness/         # Shared adapters (built with tsup)
```

Dependency direction: `server → deepagent → harness`, `livekit-agent → harness`.

## Formatting (Prettier)

- Single quotes, semicolons required, trailing commas `all`, 2-space indent, `printWidth` 80.
- Imports are auto-sorted via `@trivago/prettier-plugin-sort-imports`: third-party modules first, then relative (`^[./]`). Do not hand-order imports — run `pnpm format`.

## Linting (ESLint)

- Flat config per package (`eslint.config.ts`) extending `@eslint/js` recommended + `typescript-eslint` recommended; `dist` is ignored.
- Run per app: `pnpm <app> lint` / `pnpm <app> lint:fix`. Type-check with `pnpm <app> typecheck`.

## Modules & imports

- ESM only (`"type": "module"`). **No `.js` extension** in relative imports — use extensionless paths (built with tsup/tsc/vite).
- Use `import type { … }` for type-only imports.

## Naming

- **Files:** kebab-case with a role suffix — `*.controller.ts`, `*.service.ts`, `*.route.ts`, `*.middleware.ts`, `*.utils.ts`, `*.validator.ts`, `*.config.ts`.
- **Type declarations:** kebab-case `*.d.ts` files under `src/types/`, one per domain.
- **Classes:** PascalCase (`ApiKeyService`, `ApiKeyUtil`).
- **Functions / variables:** camelCase; factory functions prefixed with a verb (`createApp`, `loadEnv`).
- **Enums / Prisma models:** PascalCase; enum members SCREAMING_SNAKE (`ApiKeyStatus.ACTIVE`).

## Types & interfaces

- Declare `type` / `interface` in `src/types/*.d.ts` — **never inline** in implementation files. Mirror the existing `response-handler.d.ts` pattern.

## Server layering & style

- Flow: `route` (wires path + middleware + validator) → `controller` (request/response) → `service` (business logic) → `utils` (pure helpers, Prisma, integrations).
- Services and utils are classes with explicit `public` / `private` methods; document public methods with JSDoc.
- App assembly via a `createApp()` factory; middleware order matters (helmet → cors → morgan → webhook raw route → json/urlencoded → rateLimit + router → notFound → errorHandler).

## Error handling

- Use `http-errors` (`createHttpError`, `isHttpError`) and a centralized `errorHandler` middleware that normalizes unknown errors to 500 and gates `stack` behind `NODE_ENV !== 'production'`.
- Prefer returning `null` for not-found / invalid lookups in services rather than throwing; let controllers/middleware translate to HTTP errors.
- No silent failures — best-effort writes (e.g. `touchLastUsed`) are documented as such.

## Validation

- Validate input with yup schemas in `*.validator.ts`; client forms use formik + yup.

## Logging

- Structured logging with pino (`logger.utils.ts`); HTTP request logging with morgan.

## Data & security

- Prisma 7 with `@prisma/adapter-pg`; access via the singleton in `prisma.utils.ts` (never instantiate `PrismaClient` ad hoc).
- Multi-file schema by domain under `apps/server/prisma/schema/`; migrate with `pnpm server db:migrate`.
- Security: helmet + cors; hash secrets (SHA-256) and compare with `timingSafeEqual`; never log secret values.
- Use `humps` for camelCase ⇄ snake_case conversion at boundaries; standardize responses via `response-handler.utils.ts`.
- Per AGENT_RULES: never read secret values or `.env` values (keys only).

## Client (React) conventions

- React 18 + Vite 7; MUI 6 + `@emotion` for styling.
- Data fetching with `@tanstack/react-query`; routing with `@tanstack/react-router`.
- App state with `jotai`; HTTP via `axios`; forms with formik + yup.
- Component/local types in `src/types/*.d.ts`.

## Testing

- Workflow: **Skip-Testing** (no automated tests expected by default). `apps/livekit-agent` is the exception — it uses Vitest (`pnpm livekit-agent test`); follow Arrange-Act-Assert there.
