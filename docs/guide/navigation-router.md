---
title: Navigation & Angular Router
description: Recommended bridge pattern — flows emit navigation events; omega-setup subscribes and calls Router.navigateByUrl.
outline: deep
---

# Navigation & Angular Router

This topic shows how to integrate **`Router`** without coupling flows to Angular’s router APIs — a **bridge** pattern, much like Angular documentation describes **adapter** flows between libraries and framework services.

omega-angular does **not** ship a dedicated navigator class for Angular. The recommended pattern (shown in the example app) is:

1. Define a **wire name** for navigation requests, e.g. **`NAVIGATOR_EVENT`** (or `AuthWire.navigator` style constants).
2. Flows **`emit`** that event with a payload such as `{ path: '/home' }`.
3. In **`omega-setup.ts`**, register a small **EnvironmentProviders** bridge: inject **`OmegaChannel`** and **`Router`**, **`channel.on(NAVIGATOR_EVENT).pipe(takeUntilDestroyed(...))`**, then **`router.navigateByUrl(path)`**.

## Why a bridge?

- Flows stay **framework-agnostic** in intent (only channel events).
- **`Router`** stays in one place, easy to mock or extend (guards, analytics).
- You can swap navigation for dialogs or micro-frontends by changing the bridge only.

## Guards & resolvers

Use normal **`CanActivateFn`** / **`ResolveFn`**: inject **`AuthSession`** (or your services) and return URLs or data. The example exports **`authGuard`** and **`homePageResolver`** wired in routes — unrelated to Omega primitives but typical alongside flows.

## Deep links

When the user lands on a URL directly, ensure **`OmegaFlowManager`** state matches: call **`switchTo(...)`** in **`bootstrap`**, or react to router events in an initializer if you need multi-flow sync. Most apps pick one source of truth (router **or** manager) and align the other explicitly.

See [Application bootstrap](./omega-setup) and [Example app](./example-app).
