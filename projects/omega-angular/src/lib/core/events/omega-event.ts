import { OmegaObject } from '../types/omega-object';
import type { OmegaEventName } from '../semantics/omega-event-name';

/** Wire name from enum-like object or literal string. */
export type OmegaEventWireName = OmegaEventName | string;

function resolveEventWireName(name: OmegaEventWireName): string {
  return typeof name === 'string' ? name : name.name;
}

export interface OmegaEventCreateOptions {
  readonly payload?: unknown;
  readonly id?: string;
  readonly namespace?: string | null;
  readonly meta?: Readonly<Record<string, unknown>>;
}

/** Something that happened on the channel. */
export class OmegaEvent extends OmegaObject {
  readonly name: string;
  readonly payload?: unknown;
  readonly namespace?: string | null;

  constructor(init: {
    readonly id: string;
    readonly name: string;
    readonly payload?: unknown;
    readonly namespace?: string | null;
    readonly meta?: Readonly<Record<string, unknown>>;
  }) {
    super({ id: init.id, meta: init.meta });
    this.name = init.name;
    this.payload = init.payload;
    this.namespace = init.namespace;
  }

  static fromName(name: OmegaEventWireName, options: OmegaEventCreateOptions = {}): OmegaEvent {
    return new OmegaEvent({
      id: options.id ?? OmegaEvent.nextId('ev'),
      name: resolveEventWireName(name),
      payload: options.payload,
      namespace: options.namespace,
      meta: options.meta,
    });
  }

  payloadAs<T>(): T | null {
    const p = this.payload;
    if (p == null) {
      return null;
    }
    return p as T;
  }

  toJson(): Record<string, unknown> {
    const out: Record<string, unknown> = {
      id: this.id,
      name: this.name,
    };
    if (this.payload !== undefined) {
      out['payload'] = this.payload;
    }
    if (this.namespace != null) {
      out['namespace'] = this.namespace;
    }
    if (Object.keys(this.meta).length > 0) {
      out['meta'] = { ...this.meta };
    }
    return out;
  }

  static fromJson(json: Record<string, unknown>): OmegaEvent {
    const metaRaw = json['meta'];
    const meta =
      metaRaw != null && typeof metaRaw === 'object' && !Array.isArray(metaRaw)
        ? (metaRaw as Record<string, unknown>)
        : {};
    return new OmegaEvent({
      id: (json['id'] as string) ?? '',
      name: (json['name'] as string) ?? '',
      payload: json['payload'],
      namespace: (json['namespace'] as string | null | undefined) ?? null,
      meta,
    });
  }

  private static nextId(prefix: string): string {
    const c = globalThis.crypto;
    return `${prefix}:${c?.randomUUID?.() ?? `${Date.now()}`}`;
  }
}
