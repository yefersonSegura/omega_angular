/** Clave del snapshot de sesión tras éxito de login (persistencia demo del agente). */
export const AUTH_SESSION_KEY = 'omega.auth';

/** Lo emite {@link AuthFlow} tras login OK; el bridge en `omega-setup` llama al `Router`. */
export const NAVIGATOR_EVENT = 'navigator';

/**
 * Nombres de intent y eventos del módulo auth (un solo lugar; el flow usa helpers, no strings sueltas).
 */
export const AuthWire = {
  intentLogin: 'auth.login',
  loginRequested: 'auth.login.requested',
  success: 'auth.success',
  failure: 'auth.failure',
  /** UI pide cerrar sesión (lo procesa el agente; no lógica de storage en la vista). */
  logout: 'auth.logout',
} as const;

/**
 * Acciones que el behavior devuelve y el agente ejecuta (un solo sitio).
 */
export const AuthAgentAction = {
  remoteLogin: 'validateLogin',
  saveSession: 'saveSession',
  clearSession: 'clearSession',
} as const;
