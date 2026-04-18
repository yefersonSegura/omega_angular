import {
  OmegaAgentBehaviorContext,
  OmegaAgentBehaviorEngine,
  OmegaAgentReaction,
} from 'omega-angular';

import { PedidosAgentAction, PedidosWire } from './pedidos.constants';

export class PedidosLoadListBehavior extends OmegaAgentBehaviorEngine {
  override evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null {
    if (ctx.event.name === PedidosWire.listRequested) {
      return { action: PedidosAgentAction.remoteList, payload: {} };
    }
    return null;
  }
}
