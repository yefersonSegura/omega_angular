import { firstValueFrom } from 'rxjs';

import { OmegaAgent, OmegaAgentReaction, OmegaChannel } from 'omega-angular';

import type { ClienteApi } from '../services/cliente.api';
import type { ClienteListResult } from '../models/cliente.models';
import { ClienteLoadListBehavior } from './cliente.behavior';
import { ClienteAgentAction, ClienteWire } from './cliente.constants';

function runRemoteList(channel: OmegaChannel, api: ClienteApi): void {
  void firstValueFrom(api.list()).then((result: ClienteListResult) => {
    if (result.ok) {
      channel.emitNamed(ClienteWire.listSuccess, { items: result.items });
    } else {
      channel.emitNamed(ClienteWire.listFailure, { reason: result.reason });
    }
  });
}

export function createClienteAgent(channel: OmegaChannel, api: ClienteApi): OmegaAgent {
  return new OmegaAgent(channel, [new ClienteLoadListBehavior()], (reaction: OmegaAgentReaction) => {
    if (reaction.action === ClienteAgentAction.remoteList) {
      runRemoteList(channel, api);
    }
  });
}
