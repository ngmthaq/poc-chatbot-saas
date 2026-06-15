import { llm } from '@livekit/agents';
import type { z } from 'zod';
import type { BaseTool } from '../tools';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirror LiveKit's `ToolContext` element signature.
export type LiveKitFunctionTool = llm.FunctionTool<any, any, any>;

export type LiveKitToolContext = Record<string, LiveKitFunctionTool>;

/** Wrap one {@link BaseTool} into a LiveKit function tool. */
function toLiveKitTool<Schema extends z.ZodTypeAny>(
  tool: BaseTool<Schema>,
): LiveKitFunctionTool {
  return llm.tool({
    description: tool.description,
    parameters: tool.schema,
    execute: (args: z.infer<Schema>) => tool.execute(args),
  });
}

export function toLiveKitTools(tools: BaseTool[]): LiveKitToolContext {
  const context: LiveKitToolContext = {};

  for (const tool of tools) {
    context[tool.name] = toLiveKitTool(tool);
  }

  return context;
}
