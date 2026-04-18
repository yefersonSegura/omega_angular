import { OmegaChannel } from '../core/channel/omega-channel';
import { OmegaIntent } from '../core/semantics/omega-intent';
/** Base class for a flow: receives intents and emits channel events. */
export declare abstract class OmegaFlow {
    protected readonly channel: OmegaChannel;
    abstract readonly id: string;
    protected constructor(channel: OmegaChannel);
    abstract onIntent(intent: OmegaIntent): void;
    protected emit(name: string, payload?: Record<string, unknown>, namespace?: string | null): void;
}
