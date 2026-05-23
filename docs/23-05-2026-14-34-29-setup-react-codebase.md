# Plan Response — Setup React Codebase in apps/livekit-client

- From: planner
- To: Root Agent
- Title: Plan Response — Setup React Codebase in apps/livekit-client
- Description: Scaffold a production-ready React 18 + Vite 7 + TypeScript frontend in apps/livekit-client integrated into the existing pnpm workspace, with TanStack Router (file-based), TanStack Query + Devtools, MUI v6 (light mode), Axios (stub interceptors), and Jotai.

---

## Approach Summary

Greenfield scaffold of apps/livekit-client into the existing pnpm monorepo (pnpm@10.25.0, workspace glob apps/\*). Each library gets a dedicated setup module under src/lib/, src/services/, src/stores/, and src/theme/. Atomic Design is enforced structurally through folder boundaries with explicit import rules. TanStack Router uses the file-based plugin that auto-generates routeTree.gen.ts on vite dev. All providers are nested in a single main.tsx in the correct order.

## Functional Requirements

- pnpm install from root resolves all deps without conflicts
- pnpm livekit-client dev starts Vite dev server on port 5173
- TypeScript strict mode passes with zero errors
- lint:fix script exists (required by root pre-commit hook)
- Atomic Design folder boundaries enforced structurally
- TanStack Router generates routeTree.gen.ts on first dev run
- All providers correctly nested in main.tsx
- Sample HomePage renders without errors

## Non-Functional Requirements

- TypeScript strict: true + verbatimModuleSyntax
- ESLint v9 flat config matching other apps in workspace
- Prettier shared from root
- No test files (Skip-Testing)
- @ alias for clean imports from src/

## User Clarifications

- Auth interceptor: empty stub (no token logic yet)
- LiveKit SDK: not needed (client goes through livekit-server only)
- MUI: light mode only
- React Query Devtools: include in dev builds

## Files in Scope

| #   | File                                                          | Action |
| --- | ------------------------------------------------------------- | ------ |
| 1   | apps/livekit-client/package.json                              | Create |
| 2   | apps/livekit-client/tsconfig.json                             | Create |
| 3   | apps/livekit-client/vite.config.ts                            | Create |
| 4   | apps/livekit-client/eslint.config.ts                          | Create |
| 5   | apps/livekit-client/.gitignore                                | Create |
| 6   | apps/livekit-client/.env.example                              | Create |
| 7   | apps/livekit-client/index.html                                | Create |
| 8   | apps/livekit-client/README.md                                 | Create |
| 9   | apps/livekit-client/src/lib/queryClient.ts                    | Create |
| 10  | apps/livekit-client/src/services/axiosInstance.ts             | Create |
| 11  | apps/livekit-client/src/stores/index.ts                       | Create |
| 12  | apps/livekit-client/src/theme/index.ts                        | Create |
| 13  | apps/livekit-client/src/components/atoms/AppButton.tsx        | Create |
| 14  | apps/livekit-client/src/components/molecules/PageHeader.tsx   | Create |
| 15  | apps/livekit-client/src/components/templates/MainTemplate.tsx | Create |
| 16  | apps/livekit-client/src/pages/HomePage.tsx                    | Create |
| 17  | apps/livekit-client/src/routes/\_\_root.tsx                   | Create |
| 18  | apps/livekit-client/src/routes/index.tsx                      | Create |
| 19  | apps/livekit-client/src/main.tsx                              | Create |

## Risks & Assumptions

- routeTree.gen.ts does not exist until first vite dev run — TypeScript may show an error until then
- verbatimModuleSyntax requires import type for type-only imports
- Axios interceptors cannot directly read Jotai atoms — auth stub intentionally empty

## Status

- [x] Ready to execute
