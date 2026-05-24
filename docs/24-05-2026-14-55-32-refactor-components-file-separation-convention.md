# Plan Response — Refactor Components to File-Separation Convention

- From: planner
- To: Root Agent
- Title: Plan Response — Refactor all components to follow file-separation convention
- Description: Extract styles, types, and constants out of each component's `index.tsx` into dedicated `styled.ts`, `types.ts`, and `configs.ts` files per component folder.

---

## Approach Summary

Every component folder gets up to three new files alongside its `index.tsx`: `types.ts` for TypeScript interfaces/types, `configs.ts` for module-level constants, and `styled.ts` for MUI `styled()` components replacing all `sx` props. The `index.tsx` for each component is trimmed to pure JSX/rendering logic with imports from those sibling files. Barrel exports (`atoms/index.ts`, etc.) are untouched.

## Functional Requirements

- All TypeScript `interface` and `type` declarations are moved to `types.ts` within their component folder
- All module-level non-component constants are moved to `configs.ts`
- All `sx` prop usages are converted to MUI `styled()` components in `styled.ts`
- `index.tsx` contains only JSX/rendering logic and React hooks
- No `sx` props remain in any `index.tsx`
- Barrel exports continue to work without modification
- `data-lk-theme="default"` attributes are preserved on their respective elements

## Non-Functional Requirements

- No regressions in existing behavior
- `shouldForwardProp` used for all custom boolean props passed to styled components to avoid React DOM warnings
- `bgcolor` (sx shorthand) replaced with `backgroundColor` in `styled()` callbacks
- MUI spacing values correctly converted: `n` → `theme.spacing(n)` or equivalent pixel values

## Files in Scope

### Atoms

- Create: `AgentStatusBadge/types.ts`, `AgentStatusBadge/configs.ts`, `AgentStatusBadge/styled.ts`
- Modify: `AgentStatusBadge/index.tsx`
- Create: `ConnectionQualityBadge/types.ts`, `ConnectionQualityBadge/configs.ts`, `ConnectionQualityBadge/styled.ts`
- Modify: `ConnectionQualityBadge/index.tsx`
- Create: `MutedStatusDot/types.ts`, `MutedStatusDot/styled.ts`
- Modify: `MutedStatusDot/index.tsx`

### Molecules

- Create: `AgentInfoCard/types.ts`, `AgentInfoCard/styled.ts`
- Modify: `AgentInfoCard/index.tsx`
- Create: `AgentVisualizerPanel/types.ts`, `AgentVisualizerPanel/configs.ts`, `AgentVisualizerPanel/styled.ts`
- Modify: `AgentVisualizerPanel/index.tsx`
- Create: `CallControlBar/styled.ts`
- Modify: `CallControlBar/index.tsx`
- Create: `TranscriptionFeed/types.ts`, `TranscriptionFeed/styled.ts`
- Modify: `TranscriptionFeed/index.tsx`

### Pages

- Create: `HomePage/types.ts`, `HomePage/configs.ts`, `HomePage/styled.ts`
- Modify: `HomePage/index.tsx`

### Providers

- Create: `LiveKitSessionProvider/types.ts`
- Modify: `LiveKitSessionProvider/index.tsx`

## Risks & Assumptions

- MUI default theme spacing is 8px/unit; `borderRadius` default is 4px
- `bgcolor` in `sx` maps to `backgroundColor` in `styled()`
- `data-lk-theme="default"` is passed as HTML attribute at call site on styled `Box` wrappers
- `shouldForwardProp` required for `isSpeaking` (VisualizerRoot) and `isLatest` (TranscriptionEntry) props
- Two `Divider` variants needed in `AgentInfoCard`: `MetadataDivider` (mb only) and `RowDivider` (my)
- `LiveKitSessionProvider` needs only `types.ts` — no sx or constants present

## Open Questions / Blockers

- None

## Status

- [x] Ready to execute

## Task List

| #   | Status | Task                                       | Responsible Role | Dependencies | Skills       |
| --- | ------ | ------------------------------------------ | ---------------- | ------------ | ------------ |
| 1.1 | TODO   | Create `AgentStatusBadge/types.ts`         | developer        | none         | `clean-code` |
| 1.2 | TODO   | Create `AgentStatusBadge/configs.ts`       | developer        | 1.1          | `clean-code` |
| 1.3 | TODO   | Create `AgentStatusBadge/styled.ts`        | developer        | none         | `clean-code` |
| 1.4 | TODO   | Modify `AgentStatusBadge/index.tsx`        | developer        | 1.1,1.2,1.3  | `clean-code` |
| 2.1 | TODO   | Create `ConnectionQualityBadge/types.ts`   | developer        | none         | `clean-code` |
| 2.2 | TODO   | Create `ConnectionQualityBadge/configs.ts` | developer        | 2.1          | `clean-code` |
| 2.3 | TODO   | Create `ConnectionQualityBadge/styled.ts`  | developer        | none         | `clean-code` |
| 2.4 | TODO   | Modify `ConnectionQualityBadge/index.tsx`  | developer        | 2.1,2.2,2.3  | `clean-code` |
| 3.1 | TODO   | Create `MutedStatusDot/types.ts`           | developer        | none         | `clean-code` |
| 3.2 | TODO   | Create `MutedStatusDot/styled.ts`          | developer        | none         | `clean-code` |
| 3.3 | TODO   | Modify `MutedStatusDot/index.tsx`          | developer        | 3.1,3.2      | `clean-code` |
| 4.1 | TODO   | Create `AgentInfoCard/types.ts`            | developer        | none         | `clean-code` |
| 4.2 | TODO   | Create `AgentInfoCard/styled.ts`           | developer        | none         | `clean-code` |
| 4.3 | TODO   | Modify `AgentInfoCard/index.tsx`           | developer        | 4.1,4.2      | `clean-code` |
| 5.1 | TODO   | Create `AgentVisualizerPanel/types.ts`     | developer        | none         | `clean-code` |
| 5.2 | TODO   | Create `AgentVisualizerPanel/configs.ts`   | developer        | 5.1          | `clean-code` |
| 5.3 | TODO   | Create `AgentVisualizerPanel/styled.ts`    | developer        | none         | `clean-code` |
| 5.4 | TODO   | Modify `AgentVisualizerPanel/index.tsx`    | developer        | 5.1,5.2,5.3  | `clean-code` |
| 6.1 | TODO   | Create `CallControlBar/styled.ts`          | developer        | none         | `clean-code` |
| 6.2 | TODO   | Modify `CallControlBar/index.tsx`          | developer        | 6.1          | `clean-code` |
| 7.1 | TODO   | Create `TranscriptionFeed/types.ts`        | developer        | none         | `clean-code` |
| 7.2 | TODO   | Create `TranscriptionFeed/styled.ts`       | developer        | none         | `clean-code` |
| 7.3 | TODO   | Modify `TranscriptionFeed/index.tsx`       | developer        | 7.1,7.2      | `clean-code` |
| 8.1 | TODO   | Create `HomePage/types.ts`                 | developer        | none         | `clean-code` |
| 8.2 | TODO   | Create `HomePage/configs.ts`               | developer        | 8.1          | `clean-code` |
| 8.3 | TODO   | Create `HomePage/styled.ts`                | developer        | none         | `clean-code` |
| 8.4 | TODO   | Modify `HomePage/index.tsx`                | developer        | 8.1,8.2,8.3  | `clean-code` |
| 9.1 | TODO   | Create `LiveKitSessionProvider/types.ts`   | developer        | none         | `clean-code` |
| 9.2 | TODO   | Modify `LiveKitSessionProvider/index.tsx`  | developer        | 9.1          | `clean-code` |
