import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import type { FacturaListResult, FacturaRow } from '../models/factura.models';

/**
 * Mock list for the Omega demo; real apps replace with HttpClient calls under services/.
 */
@Injectable({ providedIn: 'root' })
export class FacturaApi {
  list(): Observable<FacturaListResult> {
    const items: FacturaRow[] = [
      { id: '1', nombre: 'Acme S.A.' },
      { id: '2', nombre: 'Demo Ltda.' },
    ];
    return of({ ok: true, items } satisfies FacturaListResult).pipe(delay(40));
  }
}
