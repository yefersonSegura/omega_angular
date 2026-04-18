import { OmegaObject } from '../types/omega-object';
function resolveEventWireName(name) {
    return typeof name === 'string' ? name : name.name;
}
/** Something that happened on the channel. */
export class OmegaEvent extends OmegaObject {
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
        return new OmegaEvent({
            id: options.id ?? OmegaEvent.nextId('ev'),
            name: resolveEventWireName(name),
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
    toJson() {
        const out = {
            id: this.id,
            name: this.name,
        };
        if (this.payload !== undefined) {
            out['payload'] = this.payload;
        }
        if (this.namespace != null) {
            out['namespace'] = this.namespace;
        }
        if (Object.keys(this.meta).length > 0) {
            out['meta'] = { ...this.meta };
        }
        return out;
    }
    static fromJson(json) {
        const metaRaw = json['meta'];
        const meta = metaRaw != null && typeof metaRaw === 'object' && !Array.isArray(metaRaw)
            ? metaRaw
            : {};
        return new OmegaEvent({
            id: json['id'] ?? '',
            name: json['name'] ?? '',
            payload: json['payload'],
            namespace: json['namespace'] ?? null,
            meta,
        });
    }
    static nextId(prefix) {
        const c = globalThis.crypto;
        return `${prefix}:${c?.randomUUID?.() ?? `${Date.now()}`}`;
    }
}
