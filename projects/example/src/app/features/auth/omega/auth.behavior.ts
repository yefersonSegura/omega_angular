import {
  OmegaAgentBehaviorContext,
  OmegaAgentBehaviorEngine,
  OmegaAgentReaction,
} from 'omega-angular';

import type { AuthRemoteLoginPayload, AuthSessionSnapshotPayload } from '../models/auth.models';
import { AuthAgentAction, AuthWire } from './auth.constants';

/** Pedido de logout desde la UI por el canal. */
export class AuthLogoutBehavior extends OmegaAgentBehaviorEngine {
  override evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null {
    if (ctx.event.name === AuthWire.logout) {
      return { action: AuthAgentAction.clearSession };
    }
    return null;
  }
}

/** Reacciona al evento del flow y delega la validación “remota” al ejecutor del agente. */
export class AuthLoginBehavior extends OmegaAgentBehaviorEngine {
  override evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null {
    if (ctx.event.name === AuthWire.loginRequested) {
      const payload = ctx.event.payload as AuthRemoteLoginPayload;
      return { action: AuthAgentAction.remoteLogin, payload };
    }
    return null;
  }
}

/** Tras login exitoso, persiste snapshot (efecto lateral del agente). */
export class AuthSessionBehavior extends OmegaAgentBehaviorEngine {
  override evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null {
    if (ctx.event.name === AuthWire.success) {
      const payload = ctx.event.payload as AuthSessionSnapshotPayload;
      return { action: AuthAgentAction.saveSession, payload };
    }
    return null;
  }
}
