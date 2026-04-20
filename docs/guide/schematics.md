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

By default it also adds a **login + home** starter (`features/auth` + `features/home`, routes, guards, demo session), and preconfigures inspector/logger in `omega-setup.ts`. Use **`--minimal`** to skip that and keep empty flows only.

**Layout shell:** When not using `--minimal`, the schematic applies a small **root layout** (header + `<router-outlet />` + styles) by overwriting the root template if found. It looks for **`app.html`** first (common in newer standalone apps), then **`app.component.html`**, or whatever **`templateUrl`** points to in `app.ts` / `app.component.ts`.

## `ng generate omega-angular:feature <name>`

Scaffolds a feature folder with mock **API**, **flow**, **behavior**, **agent**, and a **list page**, then merges the flow/agent into `omega-setup.ts` and adds a lazy route (expects `authGuard` if your app defines it).

When `--parent-path` is provided, the schematic now uses **`loadChildren`**:
- parent route is wired in `app.routes.ts` with `loadChildren`
- child route entries are managed in `features/<parent>/<parent>.routes.ts`

```bash
ng generate omega-angular:feature cliente --project=myApp
# optional:
#   --path=clientes          # URL segment (default: pluralized name)
#   --parent-path=admin      # create feature in features/admin/<name> and wire parent via loadChildren
#   --skip-route             # do not edit app.routes.ts
#   --skip-omega-setup       # do not edit omega-setup.ts
```

There are **no** separate schematics that generate only a **flow** or only an **agent** — use this command and delete what you do not need, or copy the pattern from an existing feature under `omega/`.

## `ng generate omega-angular:feature-remove <name>`

Deletes one generated feature folder and also removes its wiring from `omega-setup.ts` and `app.routes.ts`.

```bash
ng generate omega-angular:feature-remove cliente --project=myApp
# optional:
#   --path=clientes          # route path to remove (default: pluralized name)
#   --parent-path=admin      # remove from features/admin/<name> and from features/admin/admin.routes.ts
#   --skip-route             # do not edit app.routes.ts
#   --skip-omega-setup       # do not edit omega-setup.ts
```

Tip: it detects the feature folder from your current terminal path under `src/app` first, then falls back to `src/app/<name>` and `src/app/features/<name>`.

## Command Guide (Copy/Paste)

Use this section as a quick cookbook.

### 1) Create a top-level feature

```bash
ng generate omega-angular:feature cliente --project=example
```

What it updates:
- `features/cliente/...` files
- `omega-setup.ts` (flow + agent wiring)
- `app.routes.ts` (top-level route)

### 2) Create a child feature with `loadChildren`

```bash
ng generate omega-angular:feature invoice --project=example --parent-path=sales
```

What it updates:
- `features/sales/invoice/...` files
- `omega-setup.ts` (flow + agent wiring)
- `app.routes.ts` parent route uses `loadChildren`
- `features/sales/sales.routes.ts` adds the child route

### 3) Create a custom route path

```bash
ng generate omega-angular:feature note-debit --project=example --parent-path=sales --path=notedebits
```

This keeps folder name `note-debit` but route path `notedebits`.

### 4) Remove a top-level feature

```bash
ng generate omega-angular:feature-remove cliente --project=example
```

### 5) Remove a child feature (`loadChildren` mode)

```bash
ng generate omega-angular:feature-remove invoice --project=example --parent-path=sales
```

What it updates:
- removes `features/sales/invoice/...`
- removes child entry from `features/sales/sales.routes.ts`
- removes flow + agent wiring from `omega-setup.ts`
- if parent routes file becomes empty, removes it and parent `loadChildren` route in `app.routes.ts`

### 6) Safe variants (skip auto merge)

```bash
# Do not touch routing files
ng generate omega-angular:feature reporte --project=example --skip-route

# Do not touch omega-setup.ts
ng generate omega-angular:feature reporte --project=example --skip-omega-setup
```

## Troubleshooting

- `Unknown arguments: ...`
  - Use the schematic name exactly:
    - `omega-angular:feature`
    - `omega-angular:feature-remove`
- `Cannot find module './features/<parent>/<parent>.routes'`
  - The parent routes file is missing or stale. Re-run create/remove for that parent, or recreate the file at `features/<parent>/<parent>.routes.ts`.
- Child route appears at root instead of parent
  - Use `--parent-path=<parent>` in the same command line.
- Feature not found on remove
  - Confirm folder path and name; remove command resolves from current app path and fallbacks.

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

**After remove:** delete any remaining Omega feature folders (e.g. `features/auth/`, `features/home/`) manually if you no longer need them. See also **[ESLint](./eslint)** for what stays in the repo after uninstall.
