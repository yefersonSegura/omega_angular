import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OmegaChannel, OmegaFlowManager, OmegaIntent } from 'omega-angular';

import type { ClienteRow } from '../models/cliente.models';
import { ClienteWire } from '../omega/cliente.constants';

@Component({
  selector: 'app-cliente-page',
  imports: [],
  templateUrl: './cliente-page.component.html',
  styleUrl: './cliente-page.component.css',
})
export class ClientePageComponent {
  private readonly channel = inject(OmegaChannel);
  private readonly flowManager = inject(OmegaFlowManager);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly items = signal<readonly ClienteRow[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    this.flowManager.activate('cliente');

    this.channel
      .on(ClienteWire.listFailure)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.loading.set(false);
        this.error.set(String(ev.payloadAs<{ reason?: string }>()?.reason ?? 'Error'));
      });

    this.channel
      .on(ClienteWire.listSuccess)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.loading.set(false);
        this.error.set(null);
        const payload = ev.payloadAs<{ items?: readonly ClienteRow[] }>();
        this.items.set(payload?.items ?? []);
      });

    this.flowManager.handleIntent(OmegaIntent.fromName(ClienteWire.intentLoadList, {}));
  }
}
