import { OmegaChannel, OmegaFlow, OmegaIntent } from 'omega-angular';

import { ClienteWire } from './cliente.constants';

/** Maps UI intents to channel events (cliente feature). */
export class ClienteFlow extends OmegaFlow {
  readonly id = 'cliente';

  constructor(channel: OmegaChannel) {
    super(channel);
  }

  override onIntent(intent: OmegaIntent): void {
    if (intent.name !== ClienteWire.intentLoadList) {
      return;
    }
    this.emit(ClienteWire.listRequested, {});
  }
}
