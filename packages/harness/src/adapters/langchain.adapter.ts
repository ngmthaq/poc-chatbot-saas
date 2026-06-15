import { tool as createTool } from 'langchain';
import type { z } from 'zod';
import type { BaseTool } from '../tools';

type LangChainStructuredTool = ReturnType<typeof createTool>;

type LangChainToolSchema = NonNullable<
  NonNullable<Parameters<typeof createTool>[1]>['schema']
>;

/** Wrap one {@link BaseTool} into a LangChain structured tool. */
function toLangChainTool<Schema extends z.AnyZodObject>(
  tool: BaseTool<Schema>,
): LangChainStructuredTool {
  const schema = tool.schema as unknown as LangChainToolSchema;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createTool((args: any): Promise<string> => tool.execute(args), {
    name: tool.name,
    description: tool.description,
    schema,
  });
}

export function toLangChainTools(tools: BaseTool[]): LangChainStructuredTool[] {
  return tools.map((tool) => toLangChainTool(tool as BaseTool<z.AnyZodObject>));
}
