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

By default this also adds the **login + home** starter (auth folder, `home-page`, routes). Use **`--minimal`** for the previous “empty flows only” bootstrap.

**Feature schematic (flow + agent + page):**

```bash
ng generate omega-angular:feature my-feature --project=myApp
```

## Manual builder wiring

See the root **`README.md`** for `omega-angular:eslintThenBuild` / `eslintThenServe` and `delegateProject` / `delegateTarget`.
