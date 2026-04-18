import type { OmegaEvent } from '../core/events/omega-event';
export interface OmegaAgentBehaviorContext {
    readonly event: OmegaEvent;
}
export interface OmegaAgentReaction {
    readonly action: string;
    readonly payload?: unknown;
}
export type OmegaAgentReactionHandler = (reaction: OmegaAgentReaction) => void;
/** Rule engine hook: first non-null reaction wins for this event tick. */
export declare abstract class OmegaAgentBehaviorEngine {
    abstract evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null;
}
