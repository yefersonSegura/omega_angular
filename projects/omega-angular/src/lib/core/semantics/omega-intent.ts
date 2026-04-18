import { OmegaObject } from '../types/omega-object';
import type { OmegaIntentName } from './omega-intent-name';

export type OmegaIntentWireName = OmegaIntentName | string;

function resolveIntentWireName(name: OmegaIntentWireName): string {
  return typeof name === 'string' ? name : name.name;
}

/** Options for {@link OmegaIntent.fromName}; `P` is the shape of {@link OmegaIntent.payload}. */
export interface OmegaIntentCreateOptions<P = unknown> {
  readonly payload?: P;
  readonly id?: string;
  readonly namespace?: string | null;
  readonly meta?: Readonly<Record<string, unknown>>;
}

/**
 * UI / system request routed by {@link OmegaFlowManager}.
 * `P` is the payload type; `out` keeps the type parameter covariant so concrete intents
 * are assignable where an untyped {@link OmegaIntent} (default `unknown`) is expected.
 */
export class OmegaIntent<out P = unknown> extends OmegaObject {
  readonly name: string;
  readonly payload?: P;
  readonly namespace?: string | null;

  constructor(init: {
    readonly id: string;
    readonly name: string;
    readonly payload?: P;
    readonly namespace?: string | null;
    readonly meta?: Readonly<Record<string, unknown>>;
  }) {
    super({ id: init.id, meta: init.meta });
    this.name = init.name;
    this.payload = init.payload;
    this.namespace = init.namespace;
  }

  static fromName<P = unknown>(
    name: OmegaIntentWireName,
    options: OmegaIntentCreateOptions<P> = {},
  ): OmegaIntent<P> {
    return new OmegaIntent<P>({
      id: options.id ?? OmegaIntent.nextId(),
      name: resolveIntentWireName(name),
      payload: options.payload,
      namespace: options.namespace,
      meta: options.meta,
    });
  }

  /** When `P` is already narrow, prefer `payload`; use this to assert a subtype of `P`. */
  payloadAs<T extends P = P>(): T | null {
    const p = this.payload;
    if (p == null) {
      return null;
    }
    return p as T;
  }

  private static nextId(): string {
    const c = globalThis.crypto;
    return `intent:${c?.randomUUID?.() ?? `${Date.now()}`}`;
  }
}
