/**
 * Application-wide Omega bootstrap (`omega-setup.ts`).
 *
 * Register all flows and agents here and wire `provideOmega`. Features export flows/agents from
 * their `omega/` folders; this file only composes the bootstrap.
 */
import {
  DestroyRef,
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, type CanActivateFn, type ResolveFn } from '@angular/router';
import {
  OmegaChannel,
  provideOmega,
  provideOmegaInspector,
  provideOmegaInspectorFloatingUi,
  type OmegaProvideOptions,
} from 'omega-angular';

import { AuthApi } from './features/auth/services/auth.api';
import { AUTH_SESSION_KEY, NAVIGATOR_EVENT } from './features/auth/omega/auth.constants';
import { createAuthAgent } from './features/auth/omega/auth.agent';
import { AuthFlow } from './features/auth/omega/auth.flow';
import { AuthSession } from './features/auth/omega/auth.session';
import { FacturaApi } from './features/factura/services/factura.api';
import { createFacturaAgent } from './features/factura/omega/factura.agent';
import { FacturaFlow } from './features/factura/omega/factura.flow';
import { AppStateStore } from './shared/state/app-state.store';

export { AUTH_SESSION_KEY } from './features/auth/omega/auth.constants';

function logOmegaError(scope: string, error: unknown, extra?: Record<string, unknown>): void {
  // Centralized error sink for internal Omega runtime issues in the example app.
  console.error(`[Omega][${scope}]`, { error, ...(extra ?? {}) });
}

function createAppOmegaOptions(): OmegaProvideOptions {
  return {
    createFlows: (channel: OmegaChannel) => [
      new AuthFlow(channel),
      new FacturaFlow(channel),
      // más flows: new OrdersFlow(channel), …
    ],
    bootstrap: ({ manager }) => {
      manager.switchTo('auth');
    },
    createAgents: ({ channel }) => {
      createAuthAgent(channel, inject(AuthApi));
      createFacturaAgent(channel, inject(FacturaApi));
    },
    onChannelEmitError: (error, stack) => {
      logOmegaError('channel.emit', error, { stack });
    },
  };
}

function provideOmegaApp(): ReturnType<typeof provideOmega> {
  return provideOmega(createAppOmegaOptions());
}

/** Puente genérico: cualquier flow emite `navigator`; aquí solo se llama al `Router`. */
function provideOmegaNavigationBridge(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const channel = inject(OmegaChannel);
      const router = inject(Router);
      const destroyRef = inject(DestroyRef);
      channel
        .on(NAVIGATOR_EVENT)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((ev) => {
          const path = ev.payloadAs<{ path?: string }>()?.path;
          if (path) {
            queueMicrotask(() => void router.navigateByUrl(path));
          }
        });
    }),
  ]);
}

/** Global state bridge: every Omega event updates a shared signal store. */
function provideOmegaGlobalStateBridge(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const channel = inject(OmegaChannel);
      const store = inject(AppStateStore);
      const destroyRef = inject(DestroyRef);
      channel.events.pipe(takeUntilDestroyed(destroyRef)).subscribe((event) => {
        store.applyOmegaEvent(event);
      });
    }),
  ]);
}

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return AuthSession.isAuthed() || router.parseUrl('/login');
};

/** Datos de sesión para la vista home (lectura fuera del componente; sin storage en el `.component.ts`). */
export const homePageResolver: ResolveFn<{ displayName: string; sessionKey: string }> = () => ({
  displayName: AuthSession.displayName(),
  sessionKey: AUTH_SESSION_KEY,
});

/** Incluir en `app.config.ts`: canal, manager, flows, agents y puentes (p. ej. router). */
export const omegaSetupProviders = [
  ...provideOmegaInspector({
    broadcastChannel: true,
    consoleLog: true,
    exposeGlobal: true,
  }),
  ...provideOmegaApp(),
  provideOmegaNavigationBridge(),
  provideOmegaGlobalStateBridge(),
  /** Inspector UI: shortcut toggle overlay (Ctrl+Shift+O, no `/inspector` route). */
  ...provideOmegaInspectorFloatingUi(),
] as const;
