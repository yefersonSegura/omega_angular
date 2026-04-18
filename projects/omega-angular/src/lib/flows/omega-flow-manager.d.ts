import { OmegaChannel } from '../core/channel/omega-channel';
import { OmegaIntent } from '../core/semantics/omega-intent';
import type { OmegaFlow } from './omega-flow';
/**
 * Routes intents to active flows. Supports activate / switchTo plus handleIntent and onEvent.
 */
export declare class OmegaFlowManager {
    private readonly channel;
    private readonly flows;
    private readonly activeFlowIds;
    constructor(channel: OmegaChannel);
    getChannel(): OmegaChannel;
    registerFlow(flow: OmegaFlow): void;
    /** @deprecated Use [registerFlow] instead. */
    register(flow: OmegaFlow): void;
    /** Add a flow to the active set (multi-flow mode). */
    activate(flowId: string): void;
    deactivate(flowId: string): void;
    /** Single main flow: replace the active set. */
    switchTo(flowId: string): void;
    handleIntent(intent: OmegaIntent): void;
    /** @deprecated Use [handleIntent]. */
    dispatch(intent: OmegaIntent): void;
}
