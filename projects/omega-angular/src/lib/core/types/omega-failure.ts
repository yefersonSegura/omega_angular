import { OmegaObject, type OmegaObjectInit } from './omega-object';

export interface OmegaFailureInit extends OmegaObjectInit {
  readonly message: string;
  readonly details?: unknown;
}

/** Semantic error object (id, meta, message, details). */
export class OmegaFailure extends OmegaObject {
  readonly message: string;
  readonly details?: unknown;

  constructor(init: OmegaFailureInit) {
    super(init);
    this.message = init.message;
    this.details = init.details;
  }

  override toString(): string {
    return `OmegaFailure(id: ${this.id}, message: ${this.message}, details: ${this.details})`;
  }
}
