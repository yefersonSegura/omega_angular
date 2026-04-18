import { OmegaObject } from '../types/omega-object';
import type { OmegaEventName } from '../semantics/omega-event-name';
/** Wire name from enum-like object or literal string. */
export type OmegaEventWireName = OmegaEventName | string;
export interface OmegaEventCreateOptions {
    readonly payload?: unknown;
    readonly id?: string;
    readonly namespace?: string | null;
    readonly meta?: Readonly<Record<string, unknown>>;
}
/** Something that happened on the channel. */
export declare class OmegaEvent extends OmegaObject {
    readonly name: string;
    readonly payload?: unknown;
    readonly namespace?: string | null;
    constructor(init: {
        readonly id: string;
        readonly name: string;
        readonly payload?: unknown;
        readonly namespace?: string | null;
        readonly meta?: Readonly<Record<string, unknown>>;
    });
    static fromName(name: OmegaEventWireName, options?: OmegaEventCreateOptions): OmegaEvent;
    payloadAs<T>(): T | null;
    toJson(): Record<string, unknown>;
    static fromJson(json: Record<string, unknown>): OmegaEvent;
    private static nextId;
}
