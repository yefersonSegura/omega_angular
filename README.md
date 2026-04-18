# Omega Angular

Monorepo for **Omega Angular** (`omega-angular`): an Angular/RxJS library for the **Omega** architecture — intents → `OmegaFlowManager` → flows ↔ agents over a shared `OmegaChannel`. Everything here is **Angular** (library, tooling, example app, schematics).

**Documentation site:** [yefersonSegura.github.io/omega_angular](https://yefersonSegura.github.io/omega_angular/) (built from `docs/` with [VitePress](https://vitepress.dev/)). Edit the Markdown under `docs/`; **`npm run docs:dev`** to preview locally, **`npm run docs:build`** to build. After pushing to `main`, the **Deploy documentation** GitHub Action publishes to GitHub Pages (enable **Settings → Pages → GitHub Actions** once).

---

## Repository layout

| Path / package | Role |
| -------------- | ---- |
| `projects/omega-angular/` | Publishable library: core (`types/`, `events/`, `channel/`, flows, agents, `provideOmega()`). |
| `projects/omega-angular/eslint-then/` | Angular CLI builders: run **ESLint** at the repository root, then delegate to the real `serve` / `build` targets. |
| `projects/omega-angular/eslint-plugin/` | Bundled copy of the Omega ESLint rules plugin (same behavior as the dev-time plugin). |
| `projects/omega-angular/eslint/` | `config-omega.mjs`: flat-config snippets (`omegaAngularEslintConfigs`) for `eslint.config.mjs`. |
| `projects/omega-angular/schematics/` | **`ng add omega-angular`**, **`ng generate omega-angular:ecosystem`**, **`ng generate omega-angular:feature <name>`** (feature skeleton + merge into `omega-setup.ts` and routes). |
| `projects/example/` | Demo app: mock login, `AuthFlow`, routing, `omega-setup.ts`. |
| `projects/eslint-plugin-omega-angular/` | Source plugin used during development; the **published** copy lives inside `omega-angular`. |
| `docs/` | Public **documentation site** (VitePress): guides, schematics overview, ESLint summary. |
| `scripts/patch-omega-angular-package.mjs` | After `ng build omega-angular`, adds `exports` to `dist/omega-angular/package.json` for `./eslint-plugin/index.cjs` and `./eslint/config-omega.mjs`. |

**Compatibility:** `omega-angular` declares peers for **Angular ≥ 14** and **RxJS ≥ 7.4**. The `example` app tracks the same Angular version as this repository.

---

## If you install `omega-angular` from npm (another project)

### New Angular application

```bash
ng new my-app --defaults
cd my-app
ng add omega-angular
```

`ng new` creates the Angular shell; **`ng add omega-angular`** adds Omega on top (ESLint-first CLI, flat ESLint config, and `omega-setup.ts` / `app.config.ts`).

### Install only the package

```bash
npm install omega-angular
```

This **does not** run schematics: it only adds the dependency (library code, builders, plugin, and schematics under `node_modules/omega-angular`).

### Configure an existing project

From the directory where your **`angular.json`** lives (usually the app or repo root):

```bash
ng add omega-angular
```

**What `ng add omega-angular` does (single-command setup):**

| Area | Action |
| ---- | ------ |
| **Angular CLI** | Renames the real targets `build` → `app-build` and `serve` → `app-serve`, updates serve `buildTarget` values (e.g. `myApp:build:dev` → `myApp:app-build:dev`), and exposes `build` / `serve` using **`omega-angular:eslintThenBuild`** and **`omega-angular:eslintThenServe`** with `delegateProject` / `delegateTarget`. |
| **ESLint** | If missing, adds **devDependencies**: `eslint`, `@eslint/js`, `typescript-eslint`. If **`eslint.config.mjs`** does not exist, creates it with `eslint` + `typescript-eslint` recommended and `...omegaAngularEslintConfigs` imported from `omega-angular/eslint/config-omega.mjs`. If **`eslint.config.mjs` already exists**, tries to merge that spread into `export default tseslint.config(...)`. |
| **Ecosystem** | Creates `<sourceRoot>/app/omega-setup.ts`, merges **`app.config.ts`**, and **by default** adds the **auth + home** starter (login page, home page, routes). Use **`--minimal`** / **`ng add --minimal-ecosystem`** for empty flows only. Skipped if `omega-setup.ts` already exists (unless `--force`). |
| **Idempotency** | If targets already use the `eslintThen*` builders, `angular.json` is left as-is. If the config already imports `omega-angular/eslint/config-omega.mjs`, ESLint setup is not duplicated. |

**Useful options:**

| Option | Description |
| ------ | ----------- |
| `--project=myApp` | Application project name (default: first `projectType: "application"` in `angular.json`). |
| `--inner-build-target=app-build` | Inner build target name. |
| `--inner-serve-target=app-serve` | Inner dev-server target name. |
| `--skip-eslint-config` | Only wire `angular.json`; do not change `eslint.config.mjs` or ESLint devDependencies. |
| `--skip-ecosystem` | Skip generating `omega-setup.ts` and patching `app.config.ts`; use **`ng generate omega-angular:ecosystem`** later. |
| `--minimal-ecosystem` | With ecosystem: only minimal `omega-setup` (no AuthFlow / no generated auth or home files). |

### Ecosystem only (optional)

If you already ran **`ng add omega-angular --skip-ecosystem`**, or you want to regenerate the bootstrap file:

```bash
ng generate omega-angular:ecosystem
ng generate omega-angular:ecosystem --project=myApp
ng generate omega-angular:ecosystem --force
```

`--force` overwrites an existing `omega-setup.ts`. **`--minimal`** skips generating auth/home files (legacy minimal bootstrap).

### `omega-setup.ts` and the ecosystem schematic (default starter)

**By default**, `ng add omega-angular` and **`ng generate omega-angular:ecosystem`** (without `--minimal`) also scaffold a **login + home** starter aligned with the Omega pattern:

- **`src/app/auth/`** — `AuthFlow`, agent, mock **`AuthApi`** (`demo` / `demo`), login view.
- **`src/app/home-page/`** — home view with resolver-driven session display and logout via the channel.
- **`omega-setup.ts`** — `AuthFlow` + `createAuthAgent`, **`authGuard`**, **`homePageResolver`**, router bridge, **`omegaSetupProviders`**.
- **`app.routes.ts`** — if missing, it is created; if it exists and is **empty** (`export const routes: Routes = [];`), it is replaced with routes for `/login` and `/home`. If you already defined **`path: 'login'`**, routes are left unchanged and a warning may remind you to wire routes manually.

**Opt out of the starter** (only the minimal omega bootstrap + `app.config` merge — empty `createFlows`, no auth files):

```bash
ng generate omega-angular:ecosystem --minimal
ng add omega-angular --minimal-ecosystem
```

**This repo’s `projects/example` app** can add more features on top (extra flows, routes). The **core** login/home wiring above is the same idea as that demo.

**Layout:** Schematics resolve paths from `angular.json` (`root`, `sourceRoot`). A single app at the repo root (e.g. `sourceRoot: "src"`) still gets `src/app/...`—there is no requirement for a `projects/` folder.

### New Omega feature module (schematic)

After **`ng add omega-angular`** (or with `omega-setup.ts` already present), generate a feature folder with sample **Flow + Agent + list page**, wire an `*Api` service, and merge **`createFlows` / `createAgents`** in `omega-setup.ts` plus a lazy route. The template route uses **`canActivate: [authGuard]`** if that symbol exists (as in this example); if your app has no `authGuard`, adjust or remove that line in `app.routes.ts`.

```bash
ng generate omega-angular:feature cliente --project=myApp
# optional:
#   --path=clientes          # URL segment (default: pluralized name)
#   --skip-route             # do not edit app.routes.ts
#   --skip-omega-setup       # do not edit omega-setup.ts
```

### Requirements

- Standard **Node** and **Angular CLI**.
- For the `eslintThen*` **builders** and the **plugin**, **ESLint** must be resolvable (`eslint` in the app or monorepo root). Optional peers are listed in the library `package.json`.

### `ng serve` / `ng build` behavior

After setup, **`ng serve`** and **`ng build`** run **`eslint .`** at the repository root first; if ESLint fails, the dev server does not start and the build does not complete. That keeps the CLI and the linter aligned without relying only on npm `prestart` scripts.

---

## Developing Omega Angular (this repository)

### Clone and install

```bash
git clone <repo>
cd <repo-folder>
npm install
```

`package.json` includes **`omega-angular`: `file:projects/omega-angular`** so `omega-angular:…` builders resolve from local sources (in addition to TypeScript `paths` pointing at `./projects/omega-angular/src/public-api.ts`).

### Commands

| Command | Description |
| ------- | ----------- |
| `npm run start` | `ng serve example`: ESLint, then dev server (same contract as a consumer using `ng add`). |
| `npm run build` | `ng build example`: ESLint, then build the example app. |
| `npm run build:lib` | `eslint .` → `ng build omega-angular` → `node scripts/patch-omega-angular-package.mjs` (output in `dist/omega-angular`). |
| `npm run lint` | ESLint only for the repo (root `eslint.config.mjs`). |
| `npm test` | Unit tests for the library (`ng test omega-angular --no-watch`). |
| `npm run watch` | `ng build omega-angular --watch` in development mode. |
| `npm run ecosystem` | `ng generate omega-angular:ecosystem --project=example` (run the ecosystem schematic on the demo app). |
| `npm run docs:dev` | Local preview of the VitePress documentation site (`docs/`). |
| `npm run docs:build` | Static build to `docs/.vitepress/dist` (same output CI deploys to GitHub Pages). |
| `npm run publish:lib` | Build `dist/omega-angular` and run **`npm publish ./dist/omega-angular`** (not the private root package). Requires **`npm login`**; npm may require **2FA** (`npm publish ... --otp=CODE`). |

### Publishing the library

```bash
npm login
npm run publish:lib
# if npm asks for 2FA:
# npm publish ./dist/omega-angular --access public --otp=123456
```

Bump **`projects/omega-angular/package.json`** `version` before each new publish. The tarball includes FESM, typings, `eslint-then/`, `eslint-plugin/`, `eslint/`, `schematics/`, and a patched `package.json` with `exports` for ESLint subpaths.

---

## ESLint and Omega rules

The plugin (`omega-angular/eslint-plugin/index.cjs` in the published package) targets **application code** under a `src/` tree (e.g. `src/app/...` or `projects/<appName>/src/...` in a multi-project Angular setup).

| Rule | What it enforces |
| ---- | ---------------- |
| `omega-angular/prefer-intent-from-name` | Prefer `OmegaIntent.fromName` over `new OmegaIntent`. |
| `omega-angular/prefer-event-from-name` | Prefer Omega APIs for events in the app instead of raw `new OmegaEvent`. |
| `omega-angular/no-http-client-in-orchestration` | No `@angular/common/http` under `**/omega/**` (HTTP only in `services/`). |
| `omega-angular/no-channel-inject-in-services` | Warns on `inject(OmegaChannel)` inside `services/`. |
| `omega-angular/no-http-client-in-components` | No `HttpClient` in `*.component.ts`. |
| `omega-angular/no-value-import-from-services-in-components` | No value imports from `**/services/**` in components (`import type` is allowed). |
| `omega-angular/no-web-storage-in-components` | No `sessionStorage` / `localStorage` in components. |
| `omega-angular/no-ngrx-in-components` | No `@ngrx/*` in components (prefer Omega). |
| `omega-angular/no-omega-session-helper-in-components` | No session helper imports in views — use resolvers / agent / flow. |

In this repo, `eslint.config.mjs` loads the plugin with `require('omega-angular/eslint-plugin/index.cjs')` so development and the published package stay aligned.

---

## Recommended feature layout (example: `auth`)

Omega shares data and events through **`OmegaChannel`** / **`OmegaFlowManager`** (`inject(...)`).

**Global bootstrap:**

```
projects/example/src/app/
└── omega-setup.ts    ← provideOmega, flows, agents, router bridge, omegaSetupProviders (+ demo: guards/resolvers)
```

**Feature (domain + views):**

```
projects/example/src/app/auth/
├── services/        ← HTTP / APIs only (e.g. AuthApi)
├── models/          ← DTOs / interfaces
├── omega/           ← flow, behavior, agent, constants (no HttpClient)
└── views/           ← components
```

`app.config.ts` imports providers from `./omega-setup`.

---

## Reference

The **Omega** model (channel, intents, flows, agents) is implemented here with Angular APIs (`inject`, `bootstrapApplication`, routing).
