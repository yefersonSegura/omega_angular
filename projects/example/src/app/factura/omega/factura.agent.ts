import { firstValueFrom } from 'rxjs';

import { OmegaAgent, OmegaAgentReaction, OmegaChannel } from 'omega-angular';

import type { FacturaApi } from '../services/factura.api';
import type { FacturaListResult } from '../models/factura.models';
import { FacturaLoadListBehavior } from './factura.behavior';
import { FacturaAgentAction, FacturaWire } from './factura.constants';

function runRemoteList(channel: OmegaChannel, api: FacturaApi): void {
  void firstValueFrom(api.list()).then((result: FacturaListResult) => {
    if (result.ok) {
      channel.emitNamed(FacturaWire.listSuccess, { items: result.items });
    } else {
      channel.emitNamed(FacturaWire.listFailure, { reason: result.reason });
    }
  });
}

export function createFacturaAgent(channel: OmegaChannel, api: FacturaApi): OmegaAgent {
  return new OmegaAgent(channel, [new FacturaLoadListBehavior()], (reaction: OmegaAgentReaction) => {
    if (reaction.action === FacturaAgentAction.remoteList) {
      runRemoteList(channel, api);
    }
  });
}
