import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OmegaChannel, OmegaFlowManager, OmegaIntent } from 'omega-angular';

import { AuthWire } from '../omega/auth.constants';

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
  private readonly channel = inject(OmegaChannel);
  private readonly flowManager = inject(OmegaFlowManager);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.channel
      .on(AuthWire.failure)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.error.set(String(ev.payloadAs<{ reason?: string }>()?.reason ?? 'Login failed'));
      });
    this.channel
      .on(AuthWire.success)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.error.set(null));
  }

  protected onUsernameInput(value: string): void {
    this.username.set(value);
  }

  protected onPasswordInput(value: string): void {
    this.password.set(value);
  }

  protected submit(): void {
    this.error.set(null);
    this.flowManager.handleIntent(
      OmegaIntent.fromName(AuthWire.intentLogin, {
        payload: { username: this.username(), password: this.password() },
      }),
    );
  }
}
