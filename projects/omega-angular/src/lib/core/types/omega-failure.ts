import { OmegaObject, type OmegaObjectInit } from './omega-object';

/** Initialization shape for {@link OmegaFailure}. */
export interface OmegaFailureInit extends OmegaObjectInit {
  readonly message: string;
  readonly details?: unknown;
}

/**
 * Structured failure value (distinct from thrown `Error`) for domain-level error reporting.
 *
 * @remarks
 * Carries {@link OmegaObject.id} / {@link OmegaObject.meta} for correlation with intents or events.
 */
export class OmegaFailure extends OmegaObject {
  readonly message: string;
  readonly details?: unknown;

  constructor(init: OmegaFailureInit) {
    super(init);
    this.message = init.message;
    this.details = init.details;
  }

  /** Human-readable single-line summary for logs. */
  override toString(): string {
    return `OmegaFailure(id: ${this.id}, message: ${this.message}, details: ${this.details})`;
  }
}
