import { AUTH_SESSION_KEY } from './auth.constants';

/**
 * Lectura síncrona del snapshot guardado por el agente (p. ej. guard).
 * Para reacciones reactivas en UI, preferir `inject(OmegaChannel)` y escuchar eventos.
 */
export const AuthSession = {
  isAuthed(): boolean {
    return !!sessionStorage.getItem(AUTH_SESSION_KEY);
  },

  displayName(): string {
    try {
      const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
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
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  },
} as const;
