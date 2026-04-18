# Application bootstrap (`omega-setup.ts`)

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
