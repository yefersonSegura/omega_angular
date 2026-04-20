import { Routes } from '@angular/router';
import { authGuard, homePageResolver } from './omega-setup';
export const routes: Routes = [
    /** Base: va a `home`; si no hay sesión, `authGuard` manda a `/login`. */
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/views/auth-page.component').then((m) => m.AuthPageComponent),
    },
    {
        path: 'home',
        loadComponent: () => import('./features/home-page/home-page.component').then((m) => m.HomePageComponent),
        canActivate: [authGuard],
        resolve: { home: homePageResolver },
    },
    {
        path: 'facturas',
        canActivate: [authGuard],
    },
    { path: '**', redirectTo: 'home' }
];
