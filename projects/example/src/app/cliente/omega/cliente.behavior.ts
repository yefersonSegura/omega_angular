import {
  OmegaAgentBehaviorContext,
  OmegaAgentBehaviorEngine,
  OmegaAgentReaction,
} from 'omega-angular';

import { ClienteAgentAction, ClienteWire } from './cliente.constants';

export class ClienteLoadListBehavior extends OmegaAgentBehaviorEngine {
  override evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null {
    if (ctx.event.name === ClienteWire.listRequested) {
      return { action: ClienteAgentAction.remoteList, payload: {} };
    }
    return null;
  }
}
