import { OmegaObject } from '../types/omega-object';
import type { OmegaIntentName } from './omega-intent-name';

export type OmegaIntentWireName = OmegaIntentName | string;

function resolveIntentWireName(name: OmegaIntentWireName): string {
  return typeof name === 'string' ? name : name.name;
}

/**
 * Options for {@link OmegaIntent.fromName}.
 *
 * @typeParam P — Shape of {@link OmegaIntent.payload} when supplied.
 */
export interface OmegaIntentCreateOptions<P = unknown> {
  readonly payload?: P;
  /** Caller-supplied id; otherwise a time/uuid-based id is generated. */
  readonly id?: string;
  readonly namespace?: string | null;
  readonly meta?: Readonly<Record<string, unknown>>;
}

/**
 * Imperative request (UI action, command, navigation) routed by {@link OmegaFlowManager}
 * to every **active** {@link OmegaFlow}.
 *
 * @typeParam P — Payload type. The `out` variance keeps concrete intents assignable where an
 *   untyped {@link OmegaIntent} (`unknown`) is accepted, matching typical handler patterns.
 *
 * @remarks
 * Prefer {@link OmegaIntent.fromName} over `new OmegaIntent` so wire names and ids stay
 * consistent with ESLint rules in consumer apps.
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

  /**
   * Factory for intents resolved from an enum-like wire name or string literal.
   *
   * @param name — Semantic intent name (dotted wire convention when using enums).
   * @param options — Optional `payload`, `id`, `namespace`, `meta`.
   */
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

  /**
   * Safe cast helper for `payload` when additional narrowing is required.
   *
   * @returns `null` when `payload` is `undefined`; otherwise `payload as T`.
   */
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
