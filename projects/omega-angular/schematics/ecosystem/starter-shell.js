"use strict";

/** Minimal omega-setup: empty flows (legacy / opt-in via --minimal). */
const OMEGA_SETUP_MINIMAL = `/**
 * Global Omega bootstrap for this Angular app.
 * Register all flows and agents here; feature modules export flows and factories from **/omega/.
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
import { Router } from '@angular/router';
import { OmegaChannel, OmegaEvent, provideOmega, type OmegaProvideOptions } from 'omega-angular';

const NAVIGATOR_EVENT = OmegaEvent.fromName('navigator');

/** App wiring: add flows in createFlows; optional bootstrap / createAgents. */
function createAppOmegaOptions(): OmegaProvideOptions {
  return {
    createFlows: (_channel) => [],
  };
}

function provideOmegaApp(): Provider[] {
  return provideOmega(createAppOmegaOptions());
}

/** Maps flow "navigator" events to Angular Router. */
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

/** Add to app.config.ts together with your other ApplicationConfig.providers. */
export const omegaSetupProviders = [provideOmegaApp(), provideOmegaNavigationBridge()] as const;
`;

/** Default after ng add / ecosystem: AuthFlow + login + home wiring (demo / demo credentials). */
const OMEGA_SETUP_WITH_AUTH = `/**
 * Application-wide Omega bootstrap (\`omega-setup.ts\`).
 *
 * Register all flows and agents here and wire \`provideOmega\`. Features export flows/agents from
 * their \`omega/\` folders; this file only composes the bootstrap.
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

export { AUTH_SESSION_KEY } from './auth/omega/auth.constants';

function createAppOmegaOptions(): OmegaProvideOptions {
  return {
    createFlows: (channel: OmegaChannel) => [new AuthFlow(channel)],
    bootstrap: ({ manager }) => {
      manager.switchTo('auth');
    },
    createAgents: ({ channel }) => {
      createAuthAgent(channel, inject(AuthApi));
    },
  };
}

function provideOmegaApp(): Provider[] {
  return provideOmega(createAppOmegaOptions());
}

/** Bridge: flows emit \`navigator\` events; this subscribes and calls \`Router.navigateByUrl\`. */
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

/** Session display data for the home route (resolver keeps storage out of the component). */
export const homePageResolver: ResolveFn<{ displayName: string; sessionKey: string }> = () => ({
  displayName: AuthSession.displayName(),
  sessionKey: AUTH_SESSION_KEY,
});

/** Add with other \`ApplicationConfig.providers\` in \`app.config.ts\`. */
export const omegaSetupProviders = [provideOmegaApp(), provideOmegaNavigationBridge()] as const;
`;

const APP_ROUTES_STARTER = `import { Routes } from '@angular/router';

import { authGuard, homePageResolver } from './omega-setup';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
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
  },
  { path: '**', redirectTo: 'login' },
];
`;

/**
 * Relative paths under `src/app/` → file body.
 * @returns {ReadonlyArray<[string, string]>}
 */
function getAuthAndHomeFiles() {
  return /** @type {const} */ ([
    [
      "auth/models/auth.models.ts",
      `import { AuthAgentAction } from '../omega/auth.constants';

/** Credentials carried by intents and events toward the agent. */
export interface AuthRemoteLoginPayload {
  readonly username: string;
  readonly password: string;
}

/** Snapshot stored after successful login. */
export interface AuthSessionSnapshotPayload {
  readonly username: string;
}

export type LoginResult =
  | { readonly ok: true; readonly username: string }
  | { readonly ok: false; readonly reason: string };

export type AuthAgentReactionTyped =
  | { readonly action: typeof AuthAgentAction.remoteLogin; readonly payload: AuthRemoteLoginPayload }
  | { readonly action: typeof AuthAgentAction.saveSession; readonly payload: AuthSessionSnapshotPayload }
  | { readonly action: typeof AuthAgentAction.clearSession; readonly payload?: undefined };
`,
    ],
    [
      "auth/services/auth.api.ts",
      `import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import type { AuthRemoteLoginPayload, LoginResult } from '../models/auth.models';

export type LoginCredentials = AuthRemoteLoginPayload;

/** Mock login (replace with HttpClient in real apps). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  login(credentials: LoginCredentials): Observable<LoginResult> {
    const ok = credentials.username === 'demo' && credentials.password === 'demo';
    const result: LoginResult = ok
      ? { ok: true, username: credentials.username }
      : { ok: false, reason: 'Use username and password: demo / demo' };
    return of(result).pipe(delay(40));
  }
}
`,
    ],
    [
      "auth/omega/auth.constants.ts",
      `export const AUTH_SESSION_KEY = 'omega.auth';

export const NAVIGATOR_EVENT = 'navigator';

export const AuthWire = {
  intentLogin: 'auth.login',
  loginRequested: 'auth.login.requested',
  success: 'auth.success',
  failure: 'auth.failure',
  logout: 'auth.logout',
} as const;

export const AuthAgentAction = {
  remoteLogin: 'validateLogin',
  saveSession: 'saveSession',
  clearSession: 'clearSession',
} as const;
`,
    ],
    [
      "auth/omega/auth.flow.ts",
      `import { OmegaChannel, OmegaEvent, OmegaFlow, OmegaIntent } from 'omega-angular';

import type { AuthRemoteLoginPayload } from '../models/auth.models';
import { AuthWire, NAVIGATOR_EVENT } from './auth.constants';

export class AuthFlow extends OmegaFlow {
  readonly id = 'auth';

  constructor(channel: OmegaChannel) {
    super(channel);
  }

  override onEvent(event: OmegaEvent): void {
    if (event.name !== AuthWire.success) {
      return;
    }
    this.emit(NAVIGATOR_EVENT, { path: '/home' });
  }

  override onIntent(intent: OmegaIntent<AuthRemoteLoginPayload>): void {
    if (intent.name !== AuthWire.intentLogin) {
      return;
    }
    const username = intent.payload?.username?.trim() ?? '';
    const password = intent.payload?.password ?? '';
    if (!username || !password) {
      this.emit(AuthWire.failure, { reason: 'Username and password are required' });
      return;
    }
    this.emit(AuthWire.loginRequested, { username, password });
  }
}
`,
    ],
    [
      "auth/omega/auth.behavior.ts",
      `import {
  OmegaAgentBehaviorContext,
  OmegaAgentBehaviorEngine,
  OmegaAgentReaction,
} from 'omega-angular';

import type { AuthRemoteLoginPayload, AuthSessionSnapshotPayload } from '../models/auth.models';
import { AuthAgentAction, AuthWire } from './auth.constants';

export class AuthLogoutBehavior extends OmegaAgentBehaviorEngine {
  override evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null {
    if (ctx.event.name === AuthWire.logout) {
      return { action: AuthAgentAction.clearSession };
    }
    return null;
  }
}

export class AuthLoginBehavior extends OmegaAgentBehaviorEngine {
  override evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null {
    if (ctx.event.name === AuthWire.loginRequested) {
      const payload = ctx.event.payload as AuthRemoteLoginPayload;
      return { action: AuthAgentAction.remoteLogin, payload };
    }
    return null;
  }
}

export class AuthSessionBehavior extends OmegaAgentBehaviorEngine {
  override evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null {
    if (ctx.event.name === AuthWire.success) {
      const payload = ctx.event.payload as AuthSessionSnapshotPayload;
      return { action: AuthAgentAction.saveSession, payload };
    }
    return null;
  }
}
`,
    ],
    [
      "auth/omega/auth.agent.ts",
      `import { firstValueFrom } from 'rxjs';

import { OmegaAgent, OmegaAgentReaction, OmegaChannel } from 'omega-angular';

import type { AuthApi } from '../services/auth.api';
import type { AuthRemoteLoginPayload, AuthSessionSnapshotPayload } from '../models/auth.models';
import { AuthLoginBehavior, AuthLogoutBehavior, AuthSessionBehavior } from './auth.behavior';
import { AUTH_SESSION_KEY, AuthAgentAction, AuthWire } from './auth.constants';
import { AuthSession } from './auth.session';

function runRemoteLogin(channel: OmegaChannel, authApi: AuthApi, credentials: AuthRemoteLoginPayload): void {
  void firstValueFrom(authApi.login(credentials)).then((result) => {
    if (result.ok) {
      channel.emitNamed(AuthWire.success, { username: result.username } satisfies AuthSessionSnapshotPayload);
    } else {
      channel.emitNamed(AuthWire.failure, { reason: result.reason });
    }
  });
}

function runSaveSession(snapshot: AuthSessionSnapshotPayload): void {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(snapshot));
}

function createAuthAgentReactionHandler(
  channel: OmegaChannel,
  authApi: AuthApi,
): (reaction: OmegaAgentReaction) => void {
  return (reaction: OmegaAgentReaction) => {
    switch (reaction.action) {
      case AuthAgentAction.remoteLogin:
        runRemoteLogin(channel, authApi, reaction.payload as AuthRemoteLoginPayload);
        return;
      case AuthAgentAction.saveSession:
        runSaveSession(reaction.payload as AuthSessionSnapshotPayload);
        return;
      case AuthAgentAction.clearSession:
        AuthSession.clear();
        return;
      default:
        return;
    }
  };
}

export function createAuthAgent(channel: OmegaChannel, authApi: AuthApi): OmegaAgent {
  return new OmegaAgent(
    channel,
    [new AuthLoginBehavior(), new AuthSessionBehavior(), new AuthLogoutBehavior()],
    createAuthAgentReactionHandler(channel, authApi),
  );
}
`,
    ],
    [
      "auth/omega/auth.session.ts",
      `import { AUTH_SESSION_KEY } from './auth.constants';

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
`,
    ],
    [
      "auth/views/auth-page.component.ts",
      `import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OmegaChannel, OmegaFlowManager, OmegaIntent } from 'omega-angular';

import { AuthWire } from '../omega/auth.constants';

@Component({
  selector: 'app-auth-page',
  imports: [],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css',
})
export class AuthPageComponent {
  private readonly channel = inject(OmegaChannel);
  private readonly flowManager = inject(OmegaFlowManager);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.channel
      .on(AuthWire.failure)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.error.set(String(ev.payloadAs<{ reason?: string }>()?.reason ?? 'Login failed'));
      });
    this.channel
      .on(AuthWire.success)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.error.set(null));
  }

  protected onUsernameInput(value: string): void {
    this.username.set(value);
  }

  protected onPasswordInput(value: string): void {
    this.password.set(value);
  }

  protected submit(): void {
    this.error.set(null);
    this.flowManager.handleIntent(
      OmegaIntent.fromName(AuthWire.intentLogin, {
        payload: { username: this.username(), password: this.password() },
      }),
    );
  }
}
`,
    ],
    [
      "auth/views/auth-page.component.html",
      `<div class="card">
  <h1>Sign in</h1>
  <p class="hint">Omega starter — use <code>demo</code> / <code>demo</code></p>
  @if (error()) {
    <p class="error" role="alert">{{ error() }}</p>
  }
  <label>
    Username
    <input
      type="text"
      [value]="username()"
      (input)="onUsernameInput($any($event.target).value)"
      autocomplete="username"
    />
  </label>
  <label>
    Password
    <input
      type="password"
      [value]="password()"
      (input)="onPasswordInput($any($event.target).value)"
      autocomplete="current-password"
    />
  </label>
  <button type="button" (click)="submit()">Login</button>
</div>
`,
    ],
    [
      "auth/views/auth-page.component.css",
      `:host {
  display: block;
  max-width: 22rem;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 6%);
}

h1 {
  margin: 0;
  font-size: 1.25rem;
}

.hint {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

input {
  padding: 0.5rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
}

button {
  margin-top: 0.25rem;
  padding: 0.55rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  background: #0f172a;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background: #1e293b;
}

.error {
  margin: 0;
  padding: 0.5rem 0.6rem;
  border-radius: 0.375rem;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.875rem;
}

code {
  font-size: 0.85em;
}
`,
    ],
    [
      "home-page/home-page.component.ts",
      `import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OmegaChannel } from 'omega-angular';

import { AuthWire } from '../auth/omega/auth.constants';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  private readonly router = inject(Router);
  private readonly channel = inject(OmegaChannel);
  private readonly route = inject(ActivatedRoute);

  private readonly home = this.route.snapshot.data['home'] as {
    displayName: string;
    sessionKey: string;
  };

  protected readonly displayName = signal(this.home.displayName);
  protected readonly sessionKey = this.home.sessionKey;

  protected logout(): void {
    this.channel.emitNamed(AuthWire.logout);
    void this.router.navigate(['/login']);
  }
}
`,
    ],
    [
      "home-page/home-page.component.html",
      `<div class="wrap">
  <h1>Home</h1>
  <p>Welcome, <strong>{{ displayName() }}</strong>.</p>
  <p class="meta">
    Session key <code>{{ sessionKey }}</code> (set on <code>auth.success</code>).
  </p>
  <nav>
    <a routerLink="/login">Back to login</a>
    <button type="button" (click)="logout()">Log out</button>
  </nav>
</div>
`,
    ],
    [
      "home-page/home-page.component.css",
      `:host {
  display: block;
  max-width: 36rem;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
}

.wrap {
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #fff;
}

h1 {
  margin-top: 0;
}

.meta {
  color: #64748b;
  font-size: 0.875rem;
}

nav {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
}

button {
  padding: 0.45rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  background: #f8fafc;
  cursor: pointer;
}

a {
  color: #0f172a;
}
`,
    ],
  ]);
}

/**
 * @param {import('@angular-devkit/schematics').Tree} tree
 * @param {string} appDir no leading slash, e.g. projects/example/src/app
 * @param {import('@angular-devkit/schematics').TypedSchematicContext} context
 */
function applyStarterShell(tree, appDir, context) {
  const base = `/${appDir}`.replace(/\/+/g, "/");
  for (const [rel, body] of getAuthAndHomeFiles()) {
    const p = `${base}/${rel}`.replace(/\/+/g, "/");
    if (!tree.exists(p)) {
      tree.create(p, body);
      context.logger.info(`omega-angular: created starter ${p.replace(/^\//, "")}`);
    }
  }
}

/**
 * @param {import('@angular-devkit/schematics').Tree} tree
 * @param {string} appDir
 * @param {import('@angular-devkit/schematics').TypedSchematicContext} context
 */
function mergeOrCreateStarterRoutes(tree, appDir, context) {
  const routesPath = `/${appDir}/app.routes.ts`.replace(/\/+/g, "/");
  if (!tree.exists(routesPath)) {
    tree.create(routesPath, APP_ROUTES_STARTER);
    context.logger.info(`omega-angular: created ${routesPath.replace(/^\//, "")}`);
    return;
  }

  const before = tree.read(routesPath).toString("utf-8");
  if (/path:\s*['"]login['"]/.test(before)) {
    context.logger.info("omega-angular: app.routes.ts already defines login — left unchanged.");
    return;
  }

  const emptyRoutes =
    /export const routes:\s*Routes\s*=\s*\[\s*\]\s*;/.test(before) ||
    /export const routes:\s*Routes\s*=\s*\[\s*\n\s*\]\s*;/.test(before);

  if (emptyRoutes) {
    tree.overwrite(routesPath, APP_ROUTES_STARTER);
    context.logger.info("omega-angular: replaced empty app.routes.ts with login + home routes.");
    return;
  }

  context.logger.warn(
    "omega-angular: app.routes.ts was not empty — add login/home routes and guards manually (see package docs).",
  );
}

module.exports = {
  OMEGA_SETUP_MINIMAL,
  OMEGA_SETUP_WITH_AUTH,
  applyStarterShell,
  mergeOrCreateStarterRoutes,
};
