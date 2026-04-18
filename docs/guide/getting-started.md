# Getting started

## Install

```bash
npm install omega-angular
```

## New application

```bash
ng new my-app --defaults
cd my-app
ng add omega-angular
```

`ng add omega-angular` configures ESLint-first `build` / `serve`, optional `omega-setup.ts` with a **login + home** starter (unless `--minimal`), and merges providers into `app.config.ts`.

## Use the primitives

- Register **`provideOmega()`** (usually from `omega-setup.ts`).
- Define **flows** (`OmegaFlow`) and **agents** (`OmegaAgent`) for your domain.
- Send **intents** with `OmegaFlowManager.handleIntent` and **events** via `OmegaChannel`.

See [Core concepts](./concepts) for the mental model.

## Repository layout (example)

Feature folders often look like:

```
src/app/my-feature/
├── services/   # HttpClient / APIs only
├── models/
├── omega/      # flow, behavior, agent, constants
└── views/      # components
```

Global bootstrap stays in **`omega-setup.ts`** (flows, agents, router bridge).

## Full README

The canonical developer guide for this monorepo lives in the [GitHub repository README](https://github.com/yefersonSegura/omega_angular/blob/main/README.md).
