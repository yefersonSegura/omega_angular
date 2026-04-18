import type { Observable } from 'rxjs';
import type { OmegaEvent } from '../events/omega-event';
import type { OmegaTypedEvent } from '../semantics/omega-typed-event';
/** Emit / listen contract implemented by [OmegaChannel] and [OmegaChannelNamespace]. */
export interface OmegaEventBus {
    emit(event: OmegaEvent): void;
    emitTyped(event: OmegaTypedEvent): void;
    readonly events: Observable<OmegaEvent>;
}
