import type { OmegaEvent } from '../core/events/omega-event';

/** Input to {@link OmegaAgentBehaviorEngine.evaluate}. */
export interface OmegaAgentBehaviorContext {
  /** The channel event currently being processed. */
  readonly event: OmegaEvent;
}

/**
 * Declarative outcome from a behavior engine (e.g. `LOG`, `OPEN_MODAL`, route guard side effect).
 */
export interface OmegaAgentReaction {
  /** Stable action key interpreted by the host {@link OmegaAgent}. */
  readonly action: string;
  readonly payload?: unknown;
}

/** Callback invoked by {@link OmegaAgent} for each non-null {@link OmegaAgentReaction}. */
export type OmegaAgentReactionHandler = (reaction: OmegaAgentReaction) => void;

/**
 * Pluggable rule evaluated on every {@link OmegaEvent} handled by {@link OmegaAgent}.
 *
 * @remarks
 * Engines run in registration order. Returning `null` means “no reaction”; returning an
 * object forwards it to {@link OmegaAgentReactionHandler} immediately (no batching).
 */
export abstract class OmegaAgentBehaviorEngine {
  /**
   * @param ctx — Current event context.
   * @returns A reaction to dispatch, or `null` to skip.
   */
  abstract evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null;
}
