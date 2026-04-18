import { OmegaObject } from '../types/omega-object';
import type { OmegaIntentName } from './omega-intent-name';
export type OmegaIntentWireName = OmegaIntentName | string;
export interface OmegaIntentCreateOptions<P = unknown> {
    readonly payload?: P;
    readonly id?: string;
    readonly namespace?: string | null;
    readonly meta?: Readonly<Record<string, unknown>>;
}
export declare class OmegaIntent<out P = unknown> extends OmegaObject {
    readonly name: string;
    readonly payload?: P;
    readonly namespace?: string | null;
    constructor(init: {
        readonly id: string;
        readonly name: string;
        readonly payload?: P;
        readonly namespace?: string | null;
        readonly meta?: Readonly<Record<string, unknown>>;
    });
    static fromName<P = unknown>(name: OmegaIntentWireName, options?: OmegaIntentCreateOptions<P>): OmegaIntent<P>;
    payloadAs<T extends P = P>(): T | null;
    private static nextId;
}
