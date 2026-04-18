import { AuthAgentAction } from '../omega/auth.constants';

/** Credenciales validadas en el flow; van a intención, evento `loginRequested` y al ejecutor del agente. */
export interface AuthRemoteLoginPayload {
  readonly username: string;
  readonly password: string;
}

/** Snapshot de sesión tras `auth.success` (persistencia / guard). */
export interface AuthSessionSnapshotPayload {
  readonly username: string;
}

/**
 * Resultado normalizado del login (API / mock) para el agente.
 */
export type LoginResult =
  | { readonly ok: true; readonly username: string }
  | { readonly ok: false; readonly reason: string };

/** Unión discriminada: reacción del agente con payload tipado por `action`. */
export type AuthAgentReactionTyped =
  | { readonly action: typeof AuthAgentAction.remoteLogin; readonly payload: AuthRemoteLoginPayload }
  | { readonly action: typeof AuthAgentAction.saveSession; readonly payload: AuthSessionSnapshotPayload }
  | { readonly action: typeof AuthAgentAction.clearSession; readonly payload?: undefined };
