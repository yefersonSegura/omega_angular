import { Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { OmegaEvent } from '../events/omega-event';
import type { OmegaTypedEvent } from '../semantics/omega-typed-event';

import type { OmegaEventBus } from './omega-event-bus';

/**
 * Optional sink for errors raised while emitting on {@link OmegaChannel} or
 * {@link OmegaChannelNamespace} (including post-{@link OmegaChannel.dispose dispose} emits).
 */
export type OmegaEmitErrorHandler = (error: unknown, stack?: string) => void;

/**
 * Application-wide {@link OmegaEvent} bus backed by a `Subject` **multicasted** to subscribers
 * (no replay; subscribers only see events emitted after they subscribe).
 *
 * @remarks
 * - **Threading:** Intended for single-threaded Angular/RxJS usage within one zone.
 * - **Errors:** Subscriber errors propagate; use {@link OmegaEmitErrorHandler} via constructor
 *   options to log or report without crashing the pipeline when possible.
 * - **Scoping:** {@link OmegaChannelNamespace} tags emits with a namespace string and filters
 *   {@link OmegaChannelNamespace.events} to global events plus that namespace.
 *
 * @see {@link OmegaEventBus}
 */
export class OmegaChannel implements OmegaEventBus {
  private readonly hub = new Subject<OmegaEvent>();
  private closed = false;

  readonly events: Observable<OmegaEvent> = this.hub.asObservable();

  /** Optional handler invoked when {@link emit} fails or the channel is already disposed. */
  readonly onEmitError?: OmegaEmitErrorHandler;

  /**
   * @param options — Optional `{ onEmitError }` callback for emit-time failures.
   */
  constructor(options?: { onEmitError?: OmegaEmitErrorHandler }) {
    this.onEmitError = options?.onEmitError;
  }

  /**
   * Returns a view that prefixes emitted events with `namespace` and filters the stream
   * to global (`namespace == null`) plus this namespace’s events.
   *
   * @param name — Non-empty namespace segment (conventionally feature or bounded-context name).
   */
  namespace(name: string): OmegaChannelNamespace {
    return new OmegaChannelNamespace(this, name);
  }

  /**
   * Pushes one event to all current subscribers of {@link events}.
   *
   * @param event — Fully built {@link OmegaEvent}; prefer {@link emitNamed} or {@link emitTyped} when possible.
   */
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

  /**
   * Wraps a typed payload object as `payload` on a fresh {@link OmegaEvent} with `namespace: null`.
   *
   * @param event — Must include a discriminating `name` compatible with {@link OmegaTypedEvent}.
   */
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

  /**
   * Shorthand for {@link OmegaEvent.fromName} plus {@link emit} with a generated id.
   *
   * @param name — Wire-level event name.
   * @param payload — Optional JSON-like payload (stored by reference; clone if immutability matters).
   */
  emitNamed(name: string, payload?: Record<string, unknown>): void {
    this.emit(OmegaEvent.fromName(name, { payload }));
  }

  /**
   * @param name — Event name to filter on (equality).
   * @returns Filtered view of {@link events} for a single `name`.
   */
  on(name: string): Observable<OmegaEvent> {
    return this.events.pipe(filter((e) => e.name === name));
  }

  /**
   * Completes the underlying subject; further {@link emit} calls are ignored (or reported via {@link onEmitError}).
   */
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

/**
 * Scoped {@link OmegaEventBus} view over an {@link OmegaChannel}.
 *
 * @remarks
 * {@link emit} / {@link emitTyped} / {@link emitNamed} set `namespace` on the outgoing
 * {@link OmegaEvent}. {@link events} (and {@link on}) merge the root stream but only pass
 * through events whose `namespace` is `null` **or** equals this namespace.
 */
export class OmegaChannelNamespace implements OmegaEventBus {
  /**
   * @param channel — Parent channel that receives re-tagged events.
   * @param namespace — Namespace string applied to all emits from this view.
   */
  constructor(
    private readonly channel: OmegaChannel,
    readonly namespace: string,
  ) {}

  /**
   * Re-emits on the root channel with `namespace` forced to this namespace.
   *
   * @param event — Source event; `id`, `name`, `payload`, and `meta` are preserved.
   */
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

  /**
   * Same as {@link OmegaChannel.emitTyped} but sets `namespace` to this namespace.
   *
   * @param event — Typed payload carrying `name`.
   */
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

  /**
   * Like {@link OmegaChannel.emitNamed} with `namespace` defaulted to this namespace.
   */
  emitNamed(name: string, payload?: Record<string, unknown>): void {
    this.emit(OmegaEvent.fromName(name, { payload, namespace: this.namespace }));
  }

  /**
   * Stream of root events where `namespace` is `null` (global) or equals {@link namespace}.
   */
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

  /**
   * @param name — Event name filter (equality) on {@link events}.
   */
  on(name: string): Observable<OmegaEvent> {
    return this.events.pipe(filter((e) => e.name === name));
  }

  private static nextEventId(): string {
    const c = globalThis.crypto;
    return `ev:${c?.randomUUID?.() ?? `${Date.now()}`}`;
  }
}
