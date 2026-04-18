# Schematics

The package ships Angular schematics under `omega-angular`.

## `ng add omega-angular`

Wraps `build` / `serve` with **eslint-then** builders, sets up ESLint when possible, and runs the **ecosystem** schematic unless `--skip-ecosystem`.

Options include `--skip-eslint-config`, `--skip-ecosystem`, and `--minimal-ecosystem` (minimal `omega-setup` only).

## `ng generate omega-angular:ecosystem`

Creates or updates **`omega-setup.ts`** and merges **`omegaSetupProviders`** into **`app.config.ts`**.

By default it also adds a **login + home** starter (auth + home routes). Use **`--minimal`** to skip that and keep empty flows.

## `ng generate omega-angular:feature <name>`

Scaffolds a feature folder with mock **API**, **flow**, **behavior**, **agent**, and a **list page**, then merges the flow/agent into `omega-setup.ts` and adds a lazy route (expects `authGuard` if your app defines it).

```bash
ng generate omega-angular:feature cliente --project=myApp
# optional: --path=clientes --skip-route --skip-omega-setup
```
