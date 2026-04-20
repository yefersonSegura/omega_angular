import { Injectable, signal } from '@angular/core';
import type { OmegaEvent } from 'omega-angular';

import type { AuthSessionSnapshotPayload } from '../../features/auth/models/auth.models';
import { AuthWire } from '../../features/auth/omega/auth.constants';
import type { FacturaRow } from '../../features/factura/models/factura.models';
import { FacturaWire } from '../../features/factura/omega/factura.constants';

@Injectable({ providedIn: 'root' })
export class AppStateStore {
  readonly authError = signal<string | null>(null);
  readonly authUser = signal<string | null>(null);

  readonly facturaItems = signal<readonly FacturaRow[]>([]);
  readonly facturaError = signal<string | null>(null);
  readonly facturaLoading = signal(false);

  clearAuthError(): void {
    this.authError.set(null);
  }

  /** Update global state from Omega channel traffic. */
  applyOmegaEvent(event: OmegaEvent): void {
    switch (event.name) {
      case AuthWire.failure: {
        const reason = event.payloadAs<{ reason?: string }>()?.reason ?? 'Login failed';
        this.authError.set(String(reason));
        return;
      }
      case AuthWire.success: {
        this.authError.set(null);
        const payload = event.payloadAs<AuthSessionSnapshotPayload>();
        this.authUser.set(payload?.username ?? null);
        return;
      }
      case AuthWire.logout: {
        this.authUser.set(null);
        this.authError.set(null);
        return;
      }
      case FacturaWire.listRequested:
        this.facturaLoading.set(true);
        this.facturaError.set(null);
        return;
      case FacturaWire.listSuccess: {
        this.facturaLoading.set(false);
        this.facturaError.set(null);
        const items = event.payloadAs<{ items?: readonly FacturaRow[] }>()?.items ?? [];
        this.facturaItems.set(items);
        return;
      }
      case FacturaWire.listFailure: {
        this.facturaLoading.set(false);
        const reason = event.payloadAs<{ reason?: string }>()?.reason ?? 'Error';
        this.facturaError.set(String(reason));
        return;
      }
      default:
        return;
    }
  }
}
