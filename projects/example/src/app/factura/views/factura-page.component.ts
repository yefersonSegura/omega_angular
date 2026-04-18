import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OmegaChannel, OmegaFlowManager, OmegaIntent } from 'omega-angular';

import type { FacturaRow } from '../models/factura.models';
import { FacturaWire } from '../omega/factura.constants';

@Component({
  selector: 'app-factura-page',
  imports: [],
  templateUrl: './factura-page.component.html',
  styleUrl: './factura-page.component.css',
})
export class FacturaPageComponent {
  private readonly channel = inject(OmegaChannel);
  private readonly flowManager = inject(OmegaFlowManager);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly items = signal<readonly FacturaRow[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    this.flowManager.activate('factura');

    this.channel
      .on(FacturaWire.listFailure)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.loading.set(false);
        this.error.set(String(ev.payloadAs<{ reason?: string }>()?.reason ?? 'Error'));
      });

    this.channel
      .on(FacturaWire.listSuccess)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.loading.set(false);
        this.error.set(null);
        const payload = ev.payloadAs<{ items?: readonly FacturaRow[] }>();
        this.items.set(payload?.items ?? []);
      });

    this.flowManager.handleIntent(OmegaIntent.fromName(FacturaWire.intentLoadList, {}));
  }
}
