---
title: Schematics
description: ng add omega-angular, ecosystem, feature, and remove schematics — options, defaults, and how they touch angular.json and app.config.
outline: deep
---

# Schematics

This topic documents the **Angular CLI schematics** shipped with the package — the same category as Angular’s own **CLI** / **generation** docs: flags, defaults, and what files change.

The package ships Angular schematics under `omega-angular`.

## `ng add omega-angular`

Wraps `build` / `serve` with **eslint-then** builders, sets up ESLint when possible, and runs the **ecosystem** schematic unless `--skip-ecosystem`.

| Option | Description |
| ------ | ----------- |
| `--skip-eslint-config` | Only wire `angular.json`; do not change `eslint.config.mjs` or ESLint devDependencies. |
| `--skip-ecosystem` | Skip generating `omega-setup.ts` and patching `app.config.ts`; run **`ng generate omega-angular:ecosystem`** later. |
| `--minimal-ecosystem` | With ecosystem: minimal `omega-setup` only (no auth/home starter files). |
| `--project=myApp` | Application project name (default: first `application` in `angular.json`). |
| `--inner-build-target` / `--inner-serve-target` | Names for the inner targets (default: `app-build` / `app-serve`). |

## `ng generate omega-angular:ecosystem`

Creates or updates **`omega-setup.ts`** and merges **`omegaSetupProviders`** into **`app.config.ts`**.

By default it also adds a **login + home** starter (auth + home routes, guards, demo session). Use **`--minimal`** to skip that and keep empty flows only.

**Layout shell:** When not using `--minimal`, the schematic applies a small **root layout** (header + `<router-outlet />` + styles) by overwriting the root template if found. It looks for **`app.html`** first (common in newer standalone apps), then **`app.component.html`**, or whatever **`templateUrl`** points to in `app.ts` / `app.component.ts`.

## `ng generate omega-angular:feature <name>`

Scaffolds a feature folder with mock **API**, **flow**, **behavior**, **agent**, and a **list page**, then merges the flow/agent into `omega-setup.ts` and adds a lazy route (expects `authGuard` if your app defines it).

```bash
ng generate omega-angular:feature cliente --project=myApp
# optional:
#   --path=clientes          # URL segment (default: pluralized name)
#   --skip-route             # do not edit app.routes.ts
#   --skip-omega-setup       # do not edit omega-setup.ts
```

There are **no** separate schematics that generate only a **flow** or only an **agent** — use this command and delete what you do not need, or copy the pattern from an existing feature under `omega/`.

## `ng generate omega-angular:remove`

Reverts the integration added by **`ng add`** (and similar manual wiring): restores **`build` / `serve`** in `angular.json` from the inner targets, replaces **`eslint.config.mjs`** with a minimal flat config that does not import `omega-angular`, and strips **`omegaSetupProviders`** from **`app.config.ts`**.

```bash
ng generate omega-angular:remove
ng generate omega-angular:remove --project=myApp
ng generate omega-angular:remove --delete-omega-setup
ng generate omega-angular:remove --remove-eslint-dev-dependencies
npm uninstall omega-angular
```

| Option | Description |
| ------ | ----------- |
| `--skip-angular` | Do not change `angular.json`. |
| `--skip-eslint` | Do not change `eslint.config.mjs`. |
| `--skip-app-config` | Do not strip `omegaSetupProviders` from `app.config.ts`. |
| `--delete-omega-setup` | After updating `app.config.ts`, delete `{sourceRoot}/app/omega-setup.ts`. Ignored if `--skip-app-config` is set. |
| `--remove-eslint-dev-dependencies` | Remove `eslint`, `@eslint/js`, and `typescript-eslint` from `package.json` devDependencies (if present). |

**After remove:** delete any remaining Omega feature folders (e.g. `auth/`, `home-page/`) manually if you no longer need them. See also **[ESLint](./eslint)** for what stays in the repo after uninstall.
