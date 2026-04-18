/**
 * Routes intents to active flows. Supports activate / switchTo plus handleIntent and onEvent.
 */
export class OmegaFlowManager {
    channel;
    flows = new Map();
    activeFlowIds = new Set();
    constructor(channel) {
        this.channel = channel;
    }
    getChannel() {
        return this.channel;
    }
    registerFlow(flow) {
        this.flows.set(flow.id, flow);
    }
    /** @deprecated Use [registerFlow] instead. */
    register(flow) {
        this.registerFlow(flow);
    }
    /** Add a flow to the active set (multi-flow mode). */
    activate(flowId) {
        this.activeFlowIds.add(flowId);
    }
    deactivate(flowId) {
        this.activeFlowIds.delete(flowId);
    }
    /** Single main flow: replace the active set. */
    switchTo(flowId) {
        this.activeFlowIds.clear();
        this.activeFlowIds.add(flowId);
    }
    handleIntent(intent) {
        for (const id of this.activeFlowIds) {
            this.flows.get(id)?.onIntent(intent);
        }
    }
    /** @deprecated Use [handleIntent]. */
    dispatch(intent) {
        this.handleIntent(intent);
    }
}
