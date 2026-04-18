import { OmegaChannel, OmegaFlow, OmegaIntent } from 'omega-angular';

import { FacturaWire } from './factura.constants';

/** Maps UI intents to channel events (factura feature). */
export class FacturaFlow extends OmegaFlow {
  readonly id = 'factura';

  constructor(channel: OmegaChannel) {
    super(channel);
  }

  override onIntent(intent: OmegaIntent): void {
    if (intent.name !== FacturaWire.intentLoadList) {
      return;
    }
    this.emit(FacturaWire.listRequested, {});
  }
}
