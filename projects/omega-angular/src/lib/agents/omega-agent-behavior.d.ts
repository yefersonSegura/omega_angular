import type { OmegaEvent } from '../core/events/omega-event';
export interface OmegaAgentBehaviorContext {
    readonly event: OmegaEvent;
}
export interface OmegaAgentReaction {
    readonly action: string;
    readonly payload?: unknown;
}
export type OmegaAgentReactionHandler = (reaction: OmegaAgentReaction) => void;
/** Rule engine hook: each behavior is evaluated; every non-null reaction runs `onReaction` in order. */
export declare abstract class OmegaAgentBehaviorEngine {
    abstract evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null;
}
