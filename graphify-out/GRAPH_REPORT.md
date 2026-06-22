# Graph Report - agent-assistant (2026-06-22)

## Corpus Check

- 220 files · ~21,880 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1014 nodes · 1277 edges · 82 communities (57 shown, 25 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `7b11c889`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]

## God Nodes (most connected - your core abstractions)

1. `compilerOptions` - 25 edges
2. `compilerOptions` - 24 edges
3. `compilerOptions` - 24 edges
4. `compilerOptions` - 24 edges
5. `compilerOptions` - 21 edges
6. `fetchWithTimeout()` - 18 edges
7. `BaseTool` - 17 edges
8. `dedent()` - 16 edges
9. `compilerOptions` - 15 edges
10. `scripts` - 11 edges

## Surprising Connections (you probably didn't know these)

- `ConversationFeed()` --calls--> `useConversation()` [INFERRED]
  apps/client/src/components/molecules/ConversationFeed/index.tsx → apps/client/src/hooks/stores/useConversationStore.ts
- `VoiceSession()` --calls--> `useChatMode()` [INFERRED]
  apps/client/src/components/molecules/VoiceSession/index.tsx → apps/client/src/hooks/stores/useChatModeStore.ts
- `VoiceTranscriptionBridge()` --calls--> `useConversation()` [INFERRED]
  apps/client/src/components/molecules/VoiceTranscriptionBridge/index.tsx → apps/client/src/hooks/stores/useConversationStore.ts
- `ModeToggle()` --calls--> `usePublicConfig()` [INFERRED]
  apps/client/src/components/atoms/ModeToggle/index.tsx → apps/client/src/hooks/queries/usePublicConfig.ts
- `ModeToggle()` --calls--> `useChatMode()` [INFERRED]
  apps/client/src/components/atoms/ModeToggle/index.tsx → apps/client/src/hooks/stores/useChatModeStore.ts

## Import Cycles

- None detected.

## Communities (82 total, 25 thin omitted)

### Community 0 - "Community 0"

Cohesion: 0.07
Nodes (39): LangChainStructuredTool, LangChainToolSchema, BaseTool, AgentInstructions, convertCurrencySchema, ConvertCurrencyTool, formatNumber(), formatNumber() (+31 more)

### Community 1 - "Community 1"

Cohesion: 0.06
Nodes (30): AdminAuthController, ChatController, ConfigController, HealthController, LiveKitController, requestValidator(), adminAuthController, router (+22 more)

### Community 2 - "Community 2"

Cohesion: 0.04
Nodes (47): dependencies, axios, @emotion/react, @emotion/styled, formik, jotai, livekit-client, @livekit/components-react (+39 more)

### Community 3 - "Community 3"

Cohesion: 0.24
Nodes (5): apiKeyAuth(), apiKeyService, HealthService, config, logger

### Community 4 - "Community 4"

Cohesion: 0.04
Nodes (44): dependencies, zod, devDependencies, eslint, @eslint/js, globals, jiti, langchain (+36 more)

### Community 5 - "Community 5"

Cohesion: 0.07
Nodes (27): ControlBarRoot, CallControlBarProps, ChatView(), ChatViewRoot, InputDock, ConversationFeed(), Bubble, BubbleRow (+19 more)

### Community 6 - "Community 6"

Cohesion: 0.06
Nodes (35): dependencies, @call-center-agent/harness, deepagents, langchain, @langchain/anthropic, @langchain/core, @langchain/langgraph, @langchain/mistralai (+27 more)

### Community 7 - "Community 7"

Cohesion: 0.09
Nodes (14): STATE_CONFIG, StyledChip, AgentStatusBadgeProps, StatusConfig, QUALITY_LABELS, QualityLabel, Root, ConnectionQualityBadgeProps (+6 more)

### Community 8 - "Community 8"

Cohesion: 0.09
Nodes (18): HomePage(), BrandIcon, HeaderStack, RoomTitle, ShellBody, ShellHeader, ShellRoot, MODE_OPTIONS (+10 more)

### Community 9 - "Community 9"

Cohesion: 0.07
Nodes (27): compilerOptions, allowJs, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, exactOptionalPropertyTypes, forceConsistentCasingInFileNames (+19 more)

### Community 10 - "Community 10"

Cohesion: 0.13
Nodes (23): CONNECTION_STATE_COLORS, CONNECTION_STATE_LABELS, VoiceSession(), ColumnBox, ErrorIcon, FailureOverlay, FailureReasonList, FailureReasonText (+15 more)

### Community 11 - "Community 11"

Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, exactOptionalPropertyTypes, forceConsistentCasingInFileNames (+18 more)

### Community 12 - "Community 12"

Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, exactOptionalPropertyTypes, forceConsistentCasingInFileNames (+18 more)

### Community 13 - "Community 13"

Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, exactOptionalPropertyTypes, forceConsistentCasingInFileNames (+18 more)

### Community 14 - "Community 14"

Cohesion: 0.07
Nodes (26): author, description, devDependencies, husky, prettier, @trivago/prettier-plugin-sort-imports, engines, node (+18 more)

### Community 15 - "Community 15"

Cohesion: 0.08
Nodes (24): compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop, exactOptionalPropertyTypes, forceConsistentCasingInFileNames, isolatedModules, jsx (+16 more)

### Community 16 - "Community 16"

Cohesion: 0.14
Nodes (12): toLangChainTools(), ChatAgent, createChatAgent(), LangChainTool, RESEARCH_TOOL_NAMES, researchSubAgent, subAgents, SubAgentTools (+4 more)

### Community 17 - "Community 17"

Cohesion: 0.10
Nodes (21): dependencies, @call-center-agent/harness, dotenv, @livekit/agents, @livekit/agents-plugin-cartesia, @livekit/agents-plugin-deepgram, @livekit/agents-plugin-elevenlabs, @livekit/agents-plugin-fishaudio (+13 more)

### Community 18 - "Community 18"

Cohesion: 0.11
Nodes (7): apiEndpoints, axiosInstance, queryClient, router, defaultTheme, Logger, rootElement

### Community 19 - "Community 19"

Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, allowSyntheticDefaultImports, composite, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib (+8 more)

### Community 20 - "Community 20"

Cohesion: 0.05
Nodes (37): dependencies, bcrypt, @call-center-agent/deepagent, cors, dotenv, express, express-rate-limit, helmet (+29 more)

### Community 21 - "Community 21"

Cohesion: 0.11
Nodes (18): devDependencies, eslint, @eslint/js, globals, jiti, prisma, tsx, @types/bcrypt (+10 more)

### Community 22 - "Community 22"

Cohesion: 0.12
Nodes (15): dependencies, devDependencies, engines, node, pnpm, name, private, scripts (+7 more)

### Community 23 - "Community 23"

Cohesion: 0.17
Nodes (10): FileRoutesByFullPath, FileRoutesById, FileRoutesByPath, FileRoutesByTo, FileRouteTypes, IndexRoute, RootRouteChildren, routeTree (+2 more)

### Community 24 - "Community 24"

Cohesion: 0.29
Nodes (8): AgentIcon, CardContainer, DisplayName, IdentityText, MetadataDivider, MetadataText, NameContainer, AgentInfoCardProps

### Community 25 - "Community 25"

Cohesion: 0.29
Nodes (7): ErrorText, InputRow, MessageField, PanelRoot, SendButton, ChatForm, ChatPanelProps

### Community 26 - "Community 26"

Cohesion: 0.29
Nodes (7): OVERLAY_STATES, OverlayText, StyledProgress, VisualizerOverlay, VisualizerRoot, AgentVisualizerPanelProps, VisualizerRootProps

### Community 27 - "Community 27"

Cohesion: 0.18
Nodes (11): scripts, build, clean, dev, download-files, lint, lint:fix, start (+3 more)

### Community 29 - "Community 29"

Cohesion: 0.33
Nodes (7): EmptyState, FeedContainer, PlaceholderIcon, PlaceholderText, TranscriptionEntry, TranscriptionEntryProps, TranscriptionFeedProps

### Community 30 - "Community 30"

Cohesion: 0.20
Nodes (10): devDependencies, eslint, @eslint/js, globals, jiti, @types/node, typescript, typescript-eslint (+2 more)

### Community 31 - "Community 31"

Cohesion: 0.20
Nodes (9): StockChartResponse, StockChartResult, StockQuote, StockQuoteMeta, SymbolSuggestion, SymbolValidation, TwelveDataQuoteResponse, YahooSearchQuote (+1 more)

### Community 32 - "Community 32"

Cohesion: 0.25
Nodes (5): LiveKitFunctionTool, LiveKitToolContext, toLiveKitTool(), toLiveKitTools(), LLMAgent

### Community 33 - "Community 33"

Cohesion: 0.25
Nodes (7): engines, node, pnpm, name, private, type, version

### Community 35 - "Community 35"

Cohesion: 0.25
Nodes (7): DuckDuckGoResponse, TavilyResponse, TavilyResult, WebSearchResult, WikipediaSearchPage, WikipediaSearchResponse, WikipediaSummaryResponse

### Community 38 - "Community 38"

Cohesion: 0.40
Nodes (3): config, schema, EnvSchema

### Community 40 - "Community 40"

Cohesion: 0.40
Nodes (4): ChatMode, ConversationEntry, ConversationRole, ConversationSource

### Community 41 - "Community 41"

Cohesion: 0.40
Nodes (4): CoinMarketData, CoinSearchEntry, CoinSearchResponse, SimplePriceResponse

### Community 42 - "Community 42"

Cohesion: 0.40
Nodes (4): CurrentWeather, GeocodingResponse, GeocodingResult, WeatherForecastResponse

### Community 45 - "Community 45"

Cohesion: 0.50
Nodes (3): AgentInstructionsMode, AgentInstructionsOptions, ResolvedAgentInstructionsOptions

### Community 78 - "Community 78"

Cohesion: 0.15
Nodes (6): apiKeyService, requireBotBinding(), apiKeyService, requireScopes(), ApiKeyService, ApiKeyUtil

### Community 79 - "Community 79"

Cohesion: 0.17
Nodes (9): errorMessages, adminAuth(), adminAuthService, errorHandler(), normalizeMessage(), fileValidator(), notFoundHandler(), authRateLimitHandler (+1 more)

### Community 80 - "Community 80"

Cohesion: 0.28
Nodes (4): WebhookController, router, webhookController, WebhookService

### Community 81 - "Community 81"

Cohesion: 0.25
Nodes (6): createApp(), config, start(), adapter, { DATABASE_URL }, globalForPrisma

### Community 83 - "Community 83"

Cohesion: 0.20
Nodes (9): AdminAccessTokenPayload, AdminLoginOptions, AdminLoginResult, AdminLogoutResult, AdminPublicProfile, AdminRefreshResult, AuthenticatedAdmin, GeneratedRefreshToken (+1 more)

## Knowledge Gaps

- **505 isolated node(s):** `livekit-docs`, `name`, `version`, `private`, `type` (+500 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `useChatMode()` connect `Community 8` to `Community 10`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `VoiceSession()` connect `Community 10` to `Community 8`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `livekit-docs`, `name`, `version` to the rest of the system?**
  _505 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07111501316944688 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.055178652193577565 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
