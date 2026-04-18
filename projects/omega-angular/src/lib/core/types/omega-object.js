export class OmegaObject {
    id;
    meta;
    constructor(init) {
        this.id = init.id;
        this.meta = Object.freeze({ ...(init.meta ?? {}) });
    }
}
