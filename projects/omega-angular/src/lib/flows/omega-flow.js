import { OmegaEvent } from '../core/events/omega-event';
/** Base class for a flow: receives intents and emits channel events. */
export class OmegaFlow {
    channel;
    constructor(channel) {
        this.channel = channel;
    }
    emit(name, payload, namespace) {
        this.channel.emit(OmegaEvent.fromName(name, { payload, namespace }));
    }
}
