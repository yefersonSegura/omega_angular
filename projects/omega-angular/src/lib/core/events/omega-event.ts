import { OmegaObject } from '../types/omega-object';
import type { OmegaEventName } from '../semantics/omega-event-name';

/** Wire name from a branded {@link OmegaEventName} enum member or a plain string. */
export type OmegaEventWireName = OmegaEventName | string;

function resolveEventWireName(name: OmegaEventWireName): string {
  return typeof name === 'string' ? name : name.name;
}

/** Options for {@link OmegaEvent.fromName}. */
export interface OmegaEventCreateOptions {
  readonly payload?: unknown;
  readonly id?: string;
  readonly namespace?: string | null;
  readonly meta?: Readonly<Record<string, unknown>>;
}

/**
 * Notification that something happened, broadcast on {@link OmegaChannel}.
 *
 * @remarks
 * Events are **facts** (past tense domain signals); pair with {@link OmegaIntent} for commands.
 * Prefer {@link OmegaEvent.fromName} in application code for stable ids and lint alignment.
 */
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

  /**
   * @param name — Wire event name.
   * @param options — Optional `payload`, `id`, `namespace`, `meta`.
   */
  static fromName(name: OmegaEventWireName, options: OmegaEventCreateOptions = {}): OmegaEvent {
    return new OmegaEvent({
      id: options.id ?? OmegaEvent.nextId('ev'),
      name: resolveEventWireName(name),
      payload: options.payload,
      namespace: options.namespace,
      meta: options.meta,
    });
  }

  /**
   * @returns `null` if `payload` is missing; otherwise casts `payload` to `T`.
   */
  payloadAs<T>(): T | null {
    const p = this.payload;
    if (p == null) {
      return null;
    }
    return p as T;
  }

  /**
   * JSON-serializable representation suitable for logging or persistence adapters.
   *
   * @remarks
   * Omits `payload` when `undefined`; omits `namespace` when `null`; omits `meta` when empty.
   */
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

  /**
   * Best-effort parser for persisted or wire JSON; validates `meta` shape lightly.
   *
   * @param json — Plain object; missing fields become empty strings / `null` as implemented.
   */
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
