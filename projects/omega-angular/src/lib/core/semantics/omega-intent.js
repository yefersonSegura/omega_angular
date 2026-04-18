import { OmegaObject } from '../types/omega-object';
function resolveIntentWireName(name) {
    return typeof name === 'string' ? name : name.name;
}
/** UI / system request routed by [OmegaFlowManager]. */
export class OmegaIntent extends OmegaObject {
    name;
    payload;
    namespace;
    constructor(init) {
        super({ id: init.id, meta: init.meta });
        this.name = init.name;
        this.payload = init.payload;
        this.namespace = init.namespace;
    }
    static fromName(name, options = {}) {
        return new OmegaIntent({
            id: options.id ?? OmegaIntent.nextId(),
            name: resolveIntentWireName(name),
            payload: options.payload,
            namespace: options.namespace,
            meta: options.meta,
        });
    }
    payloadAs() {
        const p = this.payload;
        if (p == null) {
            return null;
        }
        return p;
    }
    static nextId() {
        const c = globalThis.crypto;
        return `intent:${c?.randomUUID?.() ?? `${Date.now()}`}`;
    }
}
