/** Base for Omega system objects ([OmegaEvent], [OmegaIntent], [OmegaFailure]). */
export interface OmegaObjectInit {
  readonly id: string;
  readonly meta?: Readonly<Record<string, unknown>>;
}

export abstract class OmegaObject {
  readonly id: string;
  readonly meta: Readonly<Record<string, unknown>>;

  protected constructor(init: OmegaObjectInit) {
    this.id = init.id;
    this.meta = Object.freeze({ ...(init.meta ?? {}) });
  }
}
