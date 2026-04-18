import { firstValueFrom } from 'rxjs';

import { OmegaAgent, OmegaAgentReaction, OmegaChannel } from 'omega-angular';

import type { PedidosApi } from '../services/pedidos.api';
import type { PedidosListResult } from '../models/pedidos.models';
import { PedidosLoadListBehavior } from './pedidos.behavior';
import { PedidosAgentAction, PedidosWire } from './pedidos.constants';

function runRemoteList(channel: OmegaChannel, api: PedidosApi): void {
  void firstValueFrom(api.list()).then((result: PedidosListResult) => {
    if (result.ok) {
      channel.emitNamed(PedidosWire.listSuccess, { items: result.items });
    } else {
      channel.emitNamed(PedidosWire.listFailure, { reason: result.reason });
    }
  });
}

export function createPedidosAgent(channel: OmegaChannel, api: PedidosApi): OmegaAgent {
  return new OmegaAgent(channel, [new PedidosLoadListBehavior()], (reaction: OmegaAgentReaction) => {
    if (reaction.action === PedidosAgentAction.remoteList) {
      runRemoteList(channel, api);
    }
  });
}
