import {
  OmegaAgentBehaviorContext,
  OmegaAgentBehaviorEngine,
  OmegaAgentReaction,
} from 'omega-angular';

import { FacturaAgentAction, FacturaWire } from './factura.constants';

export class FacturaLoadListBehavior extends OmegaAgentBehaviorEngine {
  override evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null {
    if (ctx.event.name === FacturaWire.listRequested) {
      return { action: FacturaAgentAction.remoteList, payload: {} };
    }
    return null;
  }
}
