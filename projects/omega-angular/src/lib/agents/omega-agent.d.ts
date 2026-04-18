import { OmegaChannel } from '../core/channel/omega-channel';
import type { OmegaAgentBehaviorEngine, OmegaAgentReactionHandler } from './omega-agent-behavior';
/** Subscribes to the channel and runs behavior engines per event. */
export declare class OmegaAgent {
    private readonly channel;
    private readonly behaviors;
    private readonly onReaction;
    private subscription?;
    constructor(channel: OmegaChannel, behaviors: readonly OmegaAgentBehaviorEngine[], onReaction: OmegaAgentReactionHandler);
    private tick;
    destroy(): void;
}
