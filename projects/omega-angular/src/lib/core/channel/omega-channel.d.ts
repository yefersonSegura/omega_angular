import { Observable } from 'rxjs';
import { OmegaEvent } from '../events/omega-event';
import type { OmegaTypedEvent } from '../semantics/omega-typed-event';
import type { OmegaEventBus } from './omega-event-bus';
export type OmegaEmitErrorHandler = (error: unknown, stack?: string) => void;
/**
 * Central event bus (broadcast, no replay). Use [OmegaChannel#namespace] for a scoped
 * [OmegaChannelNamespace].
 */
export declare class OmegaChannel implements OmegaEventBus {
    private readonly hub;
    private closed;
    readonly events: Observable<OmegaEvent>;
    readonly onEmitError?: OmegaEmitErrorHandler;
    constructor(options?: {
        onEmitError?: OmegaEmitErrorHandler;
    });
    namespace(name: string): OmegaChannelNamespace;
    emit(event: OmegaEvent): void;
    emitTyped(event: OmegaTypedEvent): void;
    /** Shorthand: build [OmegaEvent] with a fresh id. */
    emitNamed(name: string, payload?: Record<string, unknown>): void;
    /** Filter by event name on the global stream. */
    on(name: string): Observable<OmegaEvent>;
    dispose(): void;
    private static nextEventId;
}
/** Scoped view: emit tags [namespace]; [events] is global + this namespace only. */
export declare class OmegaChannelNamespace implements OmegaEventBus {
    private readonly channel;
    readonly namespace: string;
    constructor(channel: OmegaChannel, namespace: string);
    emit(event: OmegaEvent): void;
    emitTyped(event: OmegaTypedEvent): void;
    emitNamed(name: string, payload?: Record<string, unknown>): void;
    get events(): Observable<OmegaEvent>;
    on(name: string): Observable<OmegaEvent>;
    private static nextEventId;
}
