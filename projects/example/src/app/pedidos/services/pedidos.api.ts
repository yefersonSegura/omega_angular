import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import type { PedidosListResult, PedidosRow } from '../models/pedidos.models';

/**
 * Mock list for the Omega demo; real apps replace with HttpClient calls under services/.
 */
@Injectable({ providedIn: 'root' })
export class PedidosApi {
  list(): Observable<PedidosListResult> {
    const items: PedidosRow[] = [
      { id: '1', nombre: 'Acme S.A.' },
      { id: '2', nombre: 'Demo Ltda.' },
    ];
    return of({ ok: true, items } satisfies PedidosListResult).pipe(delay(40));
  }
}
