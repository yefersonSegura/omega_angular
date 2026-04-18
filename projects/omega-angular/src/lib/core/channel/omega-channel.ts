import { Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { OmegaEvent } from '../events/omega-event';
import type { OmegaTypedEvent } from '../semantics/omega-typed-event';

import type { OmegaEventBus } from './omega-event-bus';

export type OmegaEmitErrorHandler = (error: unknown, stack?: string) => void;

/**
 * Central event bus (broadcast, no replay). Use {@link OmegaChannel#namespace} for a scoped
 * {@link OmegaChannelNamespace}.
 */
export class OmegaChannel implements OmegaEventBus {
  private readonly hub = new Subject<OmegaEvent>();
  private closed = false;

  readonly events: Observable<OmegaEvent> = this.hub.asObservable();

  readonly onEmitError?: OmegaEmitErrorHandler;

  constructor(options?: { onEmitError?: OmegaEmitErrorHandler }) {
    this.onEmitError = options?.onEmitError;
  }

  namespace(name: string): OmegaChannelNamespace {
    return new OmegaChannelNamespace(this, name);
  }

  emit(event: OmegaEvent): void {
    if (this.closed) {
      this.onEmitError?.call(this, new Error('OmegaChannel is disposed, cannot emit'));
      return;
    }
    try {
      this.hub.next(event);
    } catch (e) {
      this.onEmitError?.call(this, e, e instanceof Error ? e.stack : undefined);
    }
  }

  emitTyped(event: OmegaTypedEvent): void {
    this.emit(
      new OmegaEvent({
        id: OmegaChannel.nextEventId(),
        name: event.name,
        payload: event,
        namespace: null,
        meta: {},
      }),
    );
  }

  /** Shorthand: build [OmegaEvent] with a fresh id. */
  emitNamed(name: string, payload?: Record<string, unknown>): void {
    this.emit(OmegaEvent.fromName(name, { payload }));
  }

  /** Filter by event name on the global stream. */
  on(name: string): Observable<OmegaEvent> {
    return this.events.pipe(filter((e) => e.name === name));
  }

  dispose(): void {
    if (!this.closed) {
      this.closed = true;
      this.hub.complete();
    }
  }

  private static nextEventId(): string {
    const c = globalThis.crypto;
    return `ev:${c?.randomUUID?.() ?? `${Date.now()}`}`;
  }
}

/** Scoped view: emit tags [namespace]; [events] is global + this namespace only. */
export class OmegaChannelNamespace implements OmegaEventBus {
  constructor(
    private readonly channel: OmegaChannel,
    readonly namespace: string,
  ) {}

  emit(event: OmegaEvent): void {
    this.channel.emit(
      new OmegaEvent({
        id: event.id,
        name: event.name,
        payload: event.payload,
        namespace: this.namespace,
        meta: event.meta,
      }),
    );
  }

  emitTyped(event: OmegaTypedEvent): void {
    this.emit(
      new OmegaEvent({
        id: OmegaChannelNamespace.nextEventId(),
        name: event.name,
        payload: event,
        namespace: this.namespace,
        meta: {},
      }),
    );
  }

  emitNamed(name: string, payload?: Record<string, unknown>): void {
    this.emit(OmegaEvent.fromName(name, { payload, namespace: this.namespace }));
  }

  get events(): Observable<OmegaEvent> {
    return new Observable<OmegaEvent>((subscriber) => {
      const sub: Subscription = this.channel.events.subscribe((e) => {
        const ns = e.namespace;
        if (ns == null || ns === this.namespace) {
          subscriber.next(e);
        }
      });
      return () => sub.unsubscribe();
    });
  }

  on(name: string): Observable<OmegaEvent> {
    return this.events.pipe(filter((e) => e.name === name));
  }

  private static nextEventId(): string {
    const c = globalThis.crypto;
    return `ev:${c?.randomUUID?.() ?? `${Date.now()}`}`;
  }
}
