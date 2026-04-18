import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import type { ClienteListResult, ClienteRow } from '../models/cliente.models';

/**
 * Mock list for the Omega demo; real apps replace with HttpClient calls under services/.
 */
@Injectable({ providedIn: 'root' })
export class ClienteApi {
  list(): Observable<ClienteListResult> {
    const items: ClienteRow[] = [
      { id: '1', nombre: 'Acme S.A.' },
      { id: '2', nombre: 'Demo Ltda.' },
    ];
    return of({ ok: true, items } satisfies ClienteListResult).pipe(delay(40));
  }
}
