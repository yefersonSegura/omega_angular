---
title: Application bootstrap (omega-setup.ts)
description: What omega-setup.ts contains after ng add — provideOmega, router bridge, omegaSetupProviders, and ecosystem starter options.
outline: deep
---

# Application bootstrap (`omega-setup.ts`)

This topic describes the **composition root** for Omega in a consumer app — similar in spirit to Angular’s `app.config.ts` documentation that lists which providers belong at bootstrap.

`ng add omega-angular` (or `ng generate omega-angular:ecosystem`) creates **`src/app/omega-setup.ts`** and merges **`omegaSetupProviders`** into **`app.config.ts`**.

## What it contains

1. **`provideOmega(...)`** — wires `OmegaChannel`, `OmegaFlowManager`, your **flows** and **agents**, and optional bootstrap (e.g. `switchTo('auth')`).
2. **Router bridge** — subscribes to a `navigator`-style event and calls `Router.navigateByUrl` when flows emit navigation intents.
3. **`omegaSetupProviders`** — exported array for `app.config.ts`.

## Default ecosystem starter

Unless you use **`--minimal`**, the schematic also adds a **login + home** example: `AuthFlow`, `createAuthAgent`, `authGuard`, and routes. Opt out with:

```bash
ng generate omega-angular:ecosystem --minimal
# or
ng add omega-angular --minimal-ecosystem
```

## Feature wiring

Each feature typically exposes:

- **Flow** and **create…Agent** factory from `**/omega/`
- Registration in `createFlows` / `createAgents` inside `omega-setup.ts` (or use **`ng generate omega-angular:feature`** to merge automatically).

Keep HTTP and side effects in **services** and **agents**, not in dumb view components — aligned with the bundled ESLint rules.

## Related guides

- [Data flow](./data-flow) — how bootstrap fits in the lifecycle  
- [Navigation & Router](./navigation-router) — **`provideOmegaNavigationBridge`** pattern  
- [Example app](./example-app) — full `omega-setup.ts` in `projects/example`  
