/** Base for Omega system objects ([OmegaEvent], [OmegaIntent], [OmegaFailure]). */
export interface OmegaObjectInit {
    readonly id: string;
    readonly meta?: Readonly<Record<string, unknown>>;
}
export declare abstract class OmegaObject {
    readonly id: string;
    readonly meta: Readonly<Record<string, unknown>>;
    protected constructor(init: OmegaObjectInit);
}
