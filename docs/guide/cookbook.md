---
title: Cookbook
description: End-to-end recipes for omega-angular — login-style intent, flow, agent, channel subscription, and router bridge — using patterns from the example application.
outline: deep
---

# Cookbook

These recipes mirror the **`projects/example`** app. Paths are illustrative (`src/app/...`); adjust to your workspace.

## Recipe 1 — Dispatch an intent from a component

The view **does not** call `HttpClient` for the business path: it builds an **`OmegaIntent`** and passes it to **`OmegaFlowManager`**.

```typescript
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OmegaChannel, OmegaFlowManager, OmegaIntent } from 'omega-angular';

import { AuthWire } from '../omega/auth.constants';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
})
export class AuthPageComponent {
  private readonly channel = inject(OmegaChannel);
  private readonly flowManager = inject(OmegaFlowManager);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly error = signal<string | null>(null);

  constructor() {
    this.channel
      .on(AuthWire.failure)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.error.set(String(ev.payloadAs<{ reason?: string }>()?.reason ?? 'Login failed'));
      });
  }

  protected submit(username: string, password: string): void {
    this.error.set(null);
    this.flowManager.handleIntent(
      OmegaIntent.fromName(AuthWire.intentLogin, {
        payload: { username, password },
      }),
    );
  }
}
```

**Why two injections?** **`OmegaFlowManager`** routes intents to flows. **`OmegaChannel`** lets the component subscribe to **`AuthWire.failure`** / **`AuthWire.success`** for UI feedback without a separate “login result” service.

---

## Recipe 2 — Flow: validate, then emit a channel event

The flow implements **`onIntent`** and **`onEvent`**. It emits **`AuthWire.loginRequested`** so an **agent** can perform HTTP.

```typescript
import { OmegaChannel, OmegaEvent, OmegaFlow, OmegaIntent } from 'omega-angular';
import { AuthWire, NAVIGATOR_EVENT } from './auth.constants';

export class AuthFlow extends OmegaFlow {
  readonly id = 'auth';

  constructor(channel: OmegaChannel) {
    super(channel);
  }

  override onEvent(event: OmegaEvent): void {
    if (event.name !== AuthWire.success) return;
    this.emit(NAVIGATOR_EVENT, { path: '/home' });
  }

  override onIntent(intent: OmegaIntent): void {
    if (intent.name !== AuthWire.intentLogin) return;
    const username = intent.payloadAs<{ username?: string }>()?.username?.trim() ?? '';
    const password = intent.payloadAs<{ password?: string }>()?.password ?? '';
    if (!username || !password) {
      this.emit(AuthWire.failure, { reason: 'Username and password are required' });
      return;
    }
    this.emit(AuthWire.loginRequested, { username, password });
  }
}
```

Register this flow in **`createFlows`** inside **`omega-setup.ts`** (see Recipe 5).

---

## Recipe 3 — Behavior + agent reaction (HTTP off the flow)

**Behavior** maps a channel event to a **reaction**; the **agent** runs IO.

```typescript
// auth.behavior.ts
import { OmegaAgentBehaviorContext, OmegaAgentBehaviorEngine, OmegaAgentReaction } from 'omega-angular';
import { AuthAgentAction, AuthWire } from './auth.constants';

export class AuthLoginBehavior extends OmegaAgentBehaviorEngine {
  override evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null {
    if (ctx.event.name === AuthWire.loginRequested) {
      return { action: AuthAgentAction.remoteLogin, payload: ctx.event.payload };
    }
    return null;
  }
}
```

```typescript
// auth.agent.ts — handler runs HttpClient (injected factory)
import { OmegaAgent, OmegaAgentReaction, OmegaChannel } from 'omega-angular';
import { AuthLoginBehavior } from './auth.behavior';

export function createAuthAgent(channel: OmegaChannel, authApi: AuthApi): OmegaAgent {
  return new OmegaAgent(channel, [new AuthLoginBehavior()], (reaction) => {
    if (reaction.action === AuthAgentAction.remoteLogin) {
      // call authApi.login(...), then channel.emitNamed(AuthWire.success | failure, ...)
    }
  });
}
```

::: tip Multiple behaviors
An agent takes an **array** of engines. **Each** engine runs per event; **every** non-null reaction is delivered to your handler **in order**. Split rules into small classes instead of one giant `switch`.
:::

---

## Recipe 4 — Central wire names (no magic strings)

Keep intent and event strings in one **`auth.constants.ts`** (or generated enums) so flows, agents, components, and tests share the same vocabulary:

```typescript
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
```

See **[Wire names & feature layout](./wire-names-and-layout)** and the ESLint rule **`prefer-intent-from-name`** in **[ESLint](./eslint)**.

---

## Recipe 5 — Bootstrap: flows, agents, initial route

```typescript
import { inject } from '@angular/core';
import { OmegaChannel, provideOmega, type OmegaProvideOptions } from 'omega-angular';
import { AuthApi } from './auth/services/auth.api';
import { createAuthAgent } from './auth/omega/auth.agent';
import { AuthFlow } from './auth/omega/auth.flow';

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

export const omegaSetupProviders = [provideOmega(createAppOmegaOptions())] as const;
```

Merge **`omegaSetupProviders`** into **`app.config.ts`** as shown in **[Getting started](./getting-started)**.

---

## Recipe 6 — Router bridge (framework at the edge)

Flows emit a **neutral** event (e.g. **`NAVIGATOR_EVENT`**). A single initializer listens and calls **`Router.navigateByUrl`**:

```typescript
import { DestroyRef, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { OmegaChannel } from 'omega-angular';
import { NAVIGATOR_EVENT } from './auth/omega/auth.constants';

export function provideOmegaNavigationBridge() {
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
          if (path) queueMicrotask(() => void router.navigateByUrl(path));
        });
    }),
  ]);
}
```

More context: **[Navigation & Router](./navigation-router)**.

## What’s next

- **[Example application](./example-app)** — full monorepo reference  
- **[Testing](./testing)** — assert intents and channel emissions  
- **[Data flow](./data-flow)** — sequence diagram  
