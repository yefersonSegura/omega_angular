import type { Observable } from 'rxjs';

import type { OmegaEvent } from '../events/omega-event';
import type { OmegaTypedEvent } from '../semantics/omega-typed-event';

/**
 * Minimal contract implemented by {@link OmegaChannel} and {@link OmegaChannelNamespace}.
 *
 * @remarks
 * Lets flows or services depend on a scoped bus without taking a hard dependency on the
 * concrete root channel type.
 */
export interface OmegaEventBus {
  /** Publish a fully constructed {@link OmegaEvent}. */
  emit(event: OmegaEvent): void;
  /** Publish a typed payload object as an {@link OmegaEvent} (see channel implementations). */
  emitTyped(event: OmegaTypedEvent): void;
  /** Multicast stream of events visible to this bus (global or namespace-filtered). */
  readonly events: Observable<OmegaEvent>;
}
