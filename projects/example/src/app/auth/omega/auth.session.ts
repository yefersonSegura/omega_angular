import { readAuthSessionRaw, clearAuthSessionSnapshot } from './auth.storage';

/**
 * Lectura síncrona del snapshot guardado por el agente en `localStorage` (p. ej. guard).
 * Para reacciones reactivas en UI, preferir `inject(OmegaChannel)` y escuchar eventos.
 */
export const AuthSession = {
  isAuthed(): boolean {
    return !!readAuthSessionRaw();
  },

  displayName(): string {
    try {
      const raw = readAuthSessionRaw();
      if (!raw) {
        return 'guest';
      }
      const data = JSON.parse(raw) as { username?: string };
      return data.username ?? 'guest';
    } catch {
      return 'guest';
    }
  },

  clear(): void {
    clearAuthSessionSnapshot();
  },
} as const;
