import type { OmegaEventName } from './omega-event-name';

/** Payload object that is also its own event name (emit via [OmegaEventBus.emitTyped]). */
export type OmegaTypedEvent = OmegaEventName;
