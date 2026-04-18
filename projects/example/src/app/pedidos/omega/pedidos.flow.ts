import { OmegaChannel, OmegaFlow, OmegaIntent } from 'omega-angular';

import { PedidosWire } from './pedidos.constants';

/** Maps UI intents to channel events (pedidos feature). */
export class PedidosFlow extends OmegaFlow {
  readonly id = 'pedidos';

  constructor(channel: OmegaChannel) {
    super(channel);
  }

  override onIntent(intent: OmegaIntent): void {
    if (intent.name !== PedidosWire.intentLoadList) {
      return;
    }
    this.emit(PedidosWire.listRequested, {});
  }
}
