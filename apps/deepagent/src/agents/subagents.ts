import { toolRegistry } from '@call-center-agent/harness';
import { toLangChainTools } from '@call-center-agent/harness/langchain';
import type { SubAgent } from 'deepagents';

type LangChainTool = ReturnType<typeof toLangChainTools>[number];
type SubAgentTools = NonNullable<SubAgent['tools']>;

const tools = toLangChainTools(toolRegistry);

const RESEARCH_TOOL_NAMES = [
  'getWeather',
  'getCoinPrice',
  'getGoldPrice',
  'getStockPrice',
  'convertCurrency',
] as const;

const BRANCH_TOOL_NAMES = ['searchBranchInformation'] as const;

function pickTools(names: readonly string[]): SubAgentTools {
  const selected = tools.filter((tool: LangChainTool) =>
    names.includes(tool.name),
  );
  return selected as unknown as SubAgentTools;
}

const researchSubAgent: SubAgent = {
  name: 'research',
  description:
    'Looks up live external data: weather, cryptocurrency prices, gold ' +
    'prices, stock prices, and currency conversion.',
  systemPrompt:
    'You are a research assistant. Use the available tools to fetch ' +
    'accurate, up-to-date weather, market, and currency data. Report only ' +
    'what the tools return; never invent values.',
  tools: pickTools(RESEARCH_TOOL_NAMES),
};

const branchSubAgent: SubAgent = {
  name: 'branch',
  description:
    'Answers questions about company branch locations, hours, and contact ' +
    'information.',
  systemPrompt:
    'You are a branch information assistant. Use the branch search tool to ' +
    'find and report details about company branches. Report only what the ' +
    'tool returns.',
  tools: pickTools(BRANCH_TOOL_NAMES),
};

export const subAgents: SubAgent[] = [researchSubAgent, branchSubAgent];
