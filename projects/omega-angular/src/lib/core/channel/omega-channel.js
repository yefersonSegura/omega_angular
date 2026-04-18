import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { OmegaEvent } from '../events/omega-event';
/**
 * Central event bus (broadcast, no replay). Use [OmegaChannel#namespace] for a scoped
 * [OmegaChannelNamespace].
 */
export class OmegaChannel {
    hub = new Subject();
    closed = false;
    events = this.hub.asObservable();
    onEmitError;
    constructor(options) {
        this.onEmitError = options?.onEmitError;
    }
    namespace(name) {
        return new OmegaChannelNamespace(this, name);
    }
    emit(event) {
        if (this.closed) {
            this.onEmitError?.call(this, new Error('OmegaChannel is disposed, cannot emit'));
            return;
        }
        try {
            this.hub.next(event);
        }
        catch (e) {
            this.onEmitError?.call(this, e, e instanceof Error ? e.stack : undefined);
        }
    }
    emitTyped(event) {
        this.emit(new OmegaEvent({
            id: OmegaChannel.nextEventId(),
            name: event.name,
            payload: event,
            namespace: null,
            meta: {},
        }));
    }
    /** Shorthand: build [OmegaEvent] with a fresh id. */
    emitNamed(name, payload) {
        this.emit(OmegaEvent.fromName(name, { payload }));
    }
    /** Filter by event name on the global stream. */
    on(name) {
        return this.events.pipe(filter((e) => e.name === name));
    }
    dispose() {
        if (!this.closed) {
            this.closed = true;
            this.hub.complete();
        }
    }
    static nextEventId() {
        const c = globalThis.crypto;
        return `ev:${c?.randomUUID?.() ?? `${Date.now()}`}`;
    }
}
/** Scoped view: emit tags [namespace]; [events] is global + this namespace only. */
export class OmegaChannelNamespace {
    channel;
    namespace;
    constructor(channel, namespace) {
        this.channel = channel;
        this.namespace = namespace;
    }
    emit(event) {
        this.channel.emit(new OmegaEvent({
            id: event.id,
            name: event.name,
            payload: event.payload,
            namespace: this.namespace,
            meta: event.meta,
        }));
    }
    emitTyped(event) {
        this.emit(new OmegaEvent({
            id: OmegaChannelNamespace.nextEventId(),
            name: event.name,
            payload: event,
            namespace: this.namespace,
            meta: {},
        }));
    }
    emitNamed(name, payload) {
        this.emit(OmegaEvent.fromName(name, { payload, namespace: this.namespace }));
    }
    get events() {
        return new Observable((subscriber) => {
            const sub = this.channel.events.subscribe((e) => {
                const ns = e.namespace;
                if (ns == null || ns === this.namespace) {
                    subscriber.next(e);
                }
            });
            return () => sub.unsubscribe();
        });
    }
    on(name) {
        return this.events.pipe(filter((e) => e.name === name));
    }
    static nextEventId() {
        const c = globalThis.crypto;
        return `ev:${c?.randomUUID?.() ?? `${Date.now()}`}`;
    }
}
