/** Delivery channel the assistant is responding through. */
export type AgentInstructionsMode = 'voice' | 'text';

/** Public, optional options for {@link AgentInstructions}. */
export interface AgentInstructionsOptions {
  /** Output style to generate. Defaults to `'voice'`. */
  mode?: AgentInstructionsMode;
}

/** Internal options after defaults are applied. */
export interface ResolvedAgentInstructionsOptions {
  mode: AgentInstructionsMode;
}
