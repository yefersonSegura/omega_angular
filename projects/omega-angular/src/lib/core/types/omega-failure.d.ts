import { OmegaObject, type OmegaObjectInit } from './omega-object';
export interface OmegaFailureInit extends OmegaObjectInit {
    readonly message: string;
    readonly details?: unknown;
}
/** Semantic error object (id, meta, message, details). */
export declare class OmegaFailure extends OmegaObject {
    readonly message: string;
    readonly details?: unknown;
    constructor(init: OmegaFailureInit);
    toString(): string;
}
