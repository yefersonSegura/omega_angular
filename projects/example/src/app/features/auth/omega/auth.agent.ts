import { firstValueFrom } from 'rxjs';

import { OmegaAgent, OmegaAgentReaction, OmegaChannel } from 'omega-angular';

import type { AuthApi } from '../services/auth.api';
import type { AuthRemoteLoginPayload, AuthSessionSnapshotPayload } from '../models/auth.models';
import { AuthLoginBehavior, AuthLogoutBehavior, AuthSessionBehavior } from './auth.behavior';
import { AuthAgentAction, AuthWire } from './auth.constants';
import { AuthSession } from './auth.session';
import { writeAuthSessionSnapshotJson } from './auth.storage';

function runRemoteLogin(channel: OmegaChannel, authApi: AuthApi, credentials: AuthRemoteLoginPayload): void {
  void firstValueFrom(authApi.login(credentials))
    .then((result) => {
      if (result.ok) {
        channel.emitNamed(AuthWire.success, { username: result.username } satisfies AuthSessionSnapshotPayload);
      } else {
        channel.emitNamed(AuthWire.failure, { reason: result.reason });
      }
    })
    .catch((error) => {
      console.error('[Omega][auth.agent][remoteLogin]', error);
      channel.emitNamed(AuthWire.failure, { reason: 'Unexpected login error' });
    });
}

function runSaveSession(snapshot: AuthSessionSnapshotPayload): void {
  writeAuthSessionSnapshotJson(JSON.stringify(snapshot));
}

function createAuthAgentReactionHandler(
  channel: OmegaChannel,
  authApi: AuthApi,
): (reaction: OmegaAgentReaction) => void {
  return (reaction: OmegaAgentReaction) => {
    switch (reaction.action) {
      case AuthAgentAction.remoteLogin:
        runRemoteLogin(channel, authApi, reaction.payload as AuthRemoteLoginPayload);
        return;
      case AuthAgentAction.saveSession:
        runSaveSession(reaction.payload as AuthSessionSnapshotPayload);
        return;
      case AuthAgentAction.clearSession:
        AuthSession.clear();
        return;
      default:
        return;
    }
  };
}

/**
 * Agente: behaviors + delegación de IO en {@link AuthApi}; resultados vuelven al canal.
 */
export function createAuthAgent(channel: OmegaChannel, authApi: AuthApi): OmegaAgent {
  return new OmegaAgent(
    channel,
    [new AuthLoginBehavior(), new AuthSessionBehavior(), new AuthLogoutBehavior()],
    createAuthAgentReactionHandler(channel, authApi),
    (error, context) => {
      console.error('[Omega][auth.agent]', { error, context });
    },
  );
}
