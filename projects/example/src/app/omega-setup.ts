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
  type Provider,
  provideEnvironmentInitializer,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, type CanActivateFn, type ResolveFn } from '@angular/router';
import { OmegaChannel, provideOmega, type OmegaProvideOptions } from 'omega-angular';

import { AuthApi } from './auth/services/auth.api';
import { AUTH_SESSION_KEY, NAVIGATOR_EVENT } from './auth/omega/auth.constants';
import { createAuthAgent } from './auth/omega/auth.agent';
import { AuthFlow } from './auth/omega/auth.flow';
import { AuthSession } from './auth/omega/auth.session';
import { FacturaApi } from './factura/services/factura.api';
import { createFacturaAgent } from './factura/omega/factura.agent';
import { FacturaFlow } from './factura/omega/factura.flow';
import { PedidosApi } from './pedidos/services/pedidos.api';
import { createPedidosAgent } from './pedidos/omega/pedidos.agent';
import { PedidosFlow } from './pedidos/omega/pedidos.flow';
import { ClienteApi } from './cliente/services/cliente.api';
import { createClienteAgent } from './cliente/omega/cliente.agent';
import { ClienteFlow } from './cliente/omega/cliente.flow';

export { AUTH_SESSION_KEY } from './auth/omega/auth.constants';

function createAppOmegaOptions(): OmegaProvideOptions {
  return {
    createFlows: (channel: OmegaChannel) => [
      new AuthFlow(channel),
      new FacturaFlow(channel),
      new PedidosFlow(channel),
      new ClienteFlow(channel),
      // más flows: new OrdersFlow(channel), …
    ],
    bootstrap: ({ manager }) => {
      manager.switchTo('auth');
    },
    createAgents: ({ channel }) => {
      createAuthAgent(channel, inject(AuthApi));
      createFacturaAgent(channel, inject(FacturaApi));
      createPedidosAgent(channel, inject(PedidosApi));
      createClienteAgent(channel, inject(ClienteApi));
    },
  };
}

function provideOmegaApp(): Provider[] {
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
export const omegaSetupProviders = [provideOmegaApp(), provideOmegaNavigationBridge()] as const;
