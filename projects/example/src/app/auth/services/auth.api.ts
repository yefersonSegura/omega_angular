import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import type { AuthRemoteLoginPayload, LoginResult } from '../models/auth.models';

/** Alias del contrato de login compartido con el agente / flow. */
export type LoginCredentials = AuthRemoteLoginPayload;

/**
 * Solo simulación de login (sin HTTP real). El agente orquesta; aquí solo el resultado mock.
 */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  login(credentials: LoginCredentials): Observable<LoginResult> {
    const ok = credentials.username === 'demo' && credentials.password === 'demo';
    const result: LoginResult = ok
      ? { ok: true, username: credentials.username }
      : { ok: false, reason: 'Usa usuario y contraseña: demo / demo' };
    return of(result).pipe(delay(40));
  }
}
