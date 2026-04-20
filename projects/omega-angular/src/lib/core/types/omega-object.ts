/**
 * Construction data shared by {@link OmegaObject} derivatives.
 */
export interface OmegaObjectInit {
  /** Correlation / tracing id (often uuid-prefixed by factories). */
  readonly id: string;
  /** Arbitrary metadata bag; shallow-frozen on the instance. */
  readonly meta?: Readonly<Record<string, unknown>>;
}

/**
 * Base type for {@link OmegaEvent}, {@link OmegaIntent}, and {@link OmegaFailure}.
 */
export abstract class OmegaObject {
  readonly id: string;
  readonly meta: Readonly<Record<string, unknown>>;

  protected constructor(init: OmegaObjectInit) {
    this.id = init.id;
    this.meta = Object.freeze({ ...(init.meta ?? {}) });
  }
}
