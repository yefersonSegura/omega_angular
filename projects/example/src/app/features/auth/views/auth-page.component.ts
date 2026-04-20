import { Component, inject, signal } from '@angular/core';
import { OmegaFlowManager, OmegaIntent } from 'omega-angular';

import { AuthWire } from '../omega/auth.constants';
import { AppStateStore } from '../../../shared/state/app-state.store';

/**
 * Vista login: despacha intents al flow manager y escucha el canal (patrón Omega
 * para no depender de un servicio Angular compartido manual).
 */
@Component({
  selector: 'app-auth-page',
  imports: [],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css',
})
export class AuthPageComponent {
  private readonly flowManager = inject(OmegaFlowManager);
  private readonly appState = inject(AppStateStore);

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly error = this.appState.authError;

  protected onUsernameInput(value: string): void {
    this.username.set(value);
  }

  protected onPasswordInput(value: string): void {
    this.password.set(value);
  }

  protected submit(): void {
    this.appState.clearAuthError();
    this.flowManager.handleIntent(
      OmegaIntent.fromName(AuthWire.intentLogin, {
        payload: { username: this.username(), password: this.password() },
      }),
    );
  }
}
