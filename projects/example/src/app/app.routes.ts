import { Routes } from '@angular/router';

import { authGuard, homePageResolver } from './omega-setup';

export const routes: Routes = [
  /** Base: va a `home`; si no hay sesión, `authGuard` manda a `/login`. */
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/views/auth-page.component').then((m) => m.AuthPageComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home-page/home-page.component').then((m) => m.HomePageComponent),
    canActivate: [authGuard],
    resolve: { home: homePageResolver },
  },  {
    path: 'clientes',
    loadComponent: () =>
      import('./cliente/views/cliente-page.component').then((m) => m.ClientePageComponent),
    canActivate: [authGuard],
  },  {
    path: 'pedidos',
    loadComponent: () =>
      import('./pedidos/views/pedidos-page.component').then((m) => m.PedidosPageComponent),
    canActivate: [authGuard],
  },  {
    path: 'facturas',
    loadComponent: () =>
      import('./factura/views/factura-page.component').then((m) => m.FacturaPageComponent),
    canActivate: [authGuard],
  },



  /** Rutas desconocidas: mismo criterio que la base (home + guard). */
  { path: '**', redirectTo: 'home' },
];
