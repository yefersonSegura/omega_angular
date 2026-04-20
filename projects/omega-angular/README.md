# Omega Angular (`omega-angular`)

Angular/RxJS library for the **Omega** architecture: `OmegaChannel`, intents, flows, agents, `provideOmega()`. Published on npm as **`omega-angular`**.

The tarball also ships **ESLint-first CLI builders**, the **eslint-plugin** rules, **`eslint/config-omega.mjs`**, and **Angular schematics**.

## Documentation

- **Web:** [Documentation site](https://yefersonSegura.github.io/omega_angular/) (guides and overview).
- **Repository:** full monorepo details in the root **`README.md`** (install, `ng add`, ESLint, ecosystem, example app, workflows).

## Quick start (consumer project)

**Recommended:**

```bash
npm install omega-angular
ng add omega-angular
```

- **`npm install`** only adds the dependency; it does **not** run the schematic.
- **`ng add omega-angular`** wires `angular.json` (`app-build` / `app-serve` + `omega-angular:eslintThen*`), ESLint, and **`omega-setup.ts`** / **`app.config.ts`**, unless you pass **`--skip-eslint-config`** or **`--skip-ecosystem`**.

**Ecosystem schematic alone:**

```bash
ng generate omega-angular:ecosystem
ng generate omega-angular:ecosystem --project=myApp --force
```

By default this also adds the **login + home** starter (`features/auth`, `features/home`, routes), plus inspector/logger wiring in `omega-setup.ts`. Use **`--minimal`** for the previous “empty flows only” bootstrap.

**Revert `ng add` (builders, ESLint flat config, `app.config` providers):**

```bash
ng generate omega-angular:remove
ng generate omega-angular:remove --project=myApp --remove-eslint-dev-dependencies
ng generate omega-angular:remove --delete-omega-setup
npm uninstall omega-angular
```

This restores `build` / `serve` in `angular.json` from the inner targets (`app-build` / `app-serve`), replaces `eslint.config.mjs` with a minimal config that does not import `omega-angular`, and strips `omegaSetupProviders` from `app.config.ts`. With **`--delete-omega-setup`**, it also deletes `src/app/omega-setup.ts` (after updating `app.config.ts`). Other Omega feature folders remain; remove them manually if unused.

**Feature schematic (flow + agent + page):**

```bash
ng generate omega-angular:feature my-feature --project=myApp
```

There is **no** separate schematic for only a **flow** or only an **agent** — the feature generator creates both plus page/API; trim or copy from an existing feature as needed.

**Full command tables** (`ng add`, ecosystem, feature, remove): [Schematics guide](https://yefersonSegura.github.io/omega_angular/guide/schematics) on the documentation site.

## Manual builder wiring

See the root **`README.md`** for `omega-angular:eslintThenBuild` / `eslintThenServe` and `delegateProject` / `delegateTarget`.
