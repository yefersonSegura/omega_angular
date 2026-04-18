import { OmegaObject } from './omega-object';
/** Semantic error object (id, meta, message, details). */
export class OmegaFailure extends OmegaObject {
    message;
    details;
    constructor(init) {
        super(init);
        this.message = init.message;
        this.details = init.details;
    }
    toString() {
        return `OmegaFailure(id: ${this.id}, message: ${this.message}, details: ${this.details})`;
    }
}
