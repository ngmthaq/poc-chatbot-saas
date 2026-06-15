import type { z } from 'zod';

export abstract class BaseTool<Schema extends z.ZodTypeAny = z.ZodTypeAny> {
  /** The unique tool name the language model uses to invoke this tool. */
  public abstract readonly name: string;

  /** A description used by the language model to decide whether to use this tool. */
  public abstract readonly description: string;

  /** The Zod schema validating and describing this tool's arguments. */
  public abstract readonly schema: Schema;

  public abstract execute(args: z.infer<Schema>): Promise<string>;
}
