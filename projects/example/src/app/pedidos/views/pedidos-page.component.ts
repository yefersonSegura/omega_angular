import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OmegaChannel, OmegaFlowManager, OmegaIntent } from 'omega-angular';

import type { PedidosRow } from '../models/pedidos.models';
import { PedidosWire } from '../omega/pedidos.constants';

@Component({
  selector: 'app-pedidos-page',
  imports: [],
  templateUrl: './pedidos-page.component.html',
  styleUrl: './pedidos-page.component.css',
})
export class PedidosPageComponent {
  private readonly channel = inject(OmegaChannel);
  private readonly flowManager = inject(OmegaFlowManager);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly items = signal<readonly PedidosRow[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    this.flowManager.activate('pedidos');

    this.channel
      .on(PedidosWire.listFailure)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.loading.set(false);
        this.error.set(String(ev.payloadAs<{ reason?: string }>()?.reason ?? 'Error'));
      });

    this.channel
      .on(PedidosWire.listSuccess)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.loading.set(false);
        this.error.set(null);
        const payload = ev.payloadAs<{ items?: readonly PedidosRow[] }>();
        this.items.set(payload?.items ?? []);
      });

    this.flowManager.handleIntent(OmegaIntent.fromName(PedidosWire.intentLoadList, {}));
  }
}
