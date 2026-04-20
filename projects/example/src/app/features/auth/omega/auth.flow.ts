import { OmegaChannel, OmegaEvent, OmegaFlow, OmegaIntent } from 'omega-angular';

import type { AuthRemoteLoginPayload } from '../models/auth.models';
import { AuthWire, NAVIGATOR_EVENT } from './auth.constants';

/**
 * Flujo auth: intents → eventos en el canal.
 * Tras login correcto (`auth.success` del agente), {@link onEvent} decide la pantalla siguiente.
 */
export class AuthFlow extends OmegaFlow {
  readonly id = 'auth';

  constructor(channel: OmegaChannel) {
    super(channel);
  }

  override onEvent(event: OmegaEvent): void {
    if (event.name !== AuthWire.success) {
      return;
    }
    this.emit(NAVIGATOR_EVENT, { path: '/home' });
  }

  override onIntent(intent: OmegaIntent<AuthRemoteLoginPayload>): void {
    if (intent.name !== AuthWire.intentLogin) {
      return;
    }
    const username = intent.payload?.username?.trim() ?? '';
    const password = intent.payload?.password ?? '';
    if (!username || !password) {
      this.emit(AuthWire.failure, { reason: 'Username and password are required' });
      return;
    }
    this.emitLoginRequested(username, password);
  }

  /** Pide al agente validar credenciales (nombre del evento encapsulado en {@link AuthWire}). */
  private emitLoginRequested(username: string, password: string): void {
    this.emit(AuthWire.loginRequested, { username, password });
  }
}
