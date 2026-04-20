import { AUTH_SESSION_KEY } from './auth.constants';

/**
 * Persistencia del snapshot de sesión (demo): `localStorage` sobrevive al cerrar el navegador.
 * El agente escribe tras `auth.success`; el guard lee aquí.
 */
export function readAuthSessionRaw(): string | null {
  return localStorage.getItem(AUTH_SESSION_KEY);
}

export function writeAuthSessionSnapshotJson(json: string): void {
  localStorage.setItem(AUTH_SESSION_KEY, json);
}

export function clearAuthSessionSnapshot(): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
}
