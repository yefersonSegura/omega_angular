# Getting started

Not sure Omega fits your app? Read **[Vision & why Omega](./vision-and-why)** before investing in the flow/agent structure.

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

To **undo** that wiring (builders, ESLint config, providers, optionally `omega-setup.ts`), use **`ng generate omega-angular:remove`** then **`npm uninstall omega-angular`** — see **[Schematics](./schematics)**.

## Use the primitives

- Register **`provideOmega()`** (usually from `omega-setup.ts`).
- Define **flows** (`OmegaFlow`) and **agents** (`OmegaAgent`) for your domain.
- Send **intents** with `OmegaFlowManager.handleIntent` and **events** via `OmegaChannel`.

## Learn the runtime

1. [Core concepts](./concepts) — glossary and diagram  
2. [Data flow](./data-flow) — intents → flows → channel → agents  
3. [Channel & events](./channel-events), [Intents & flows](./intents-flows-manager), [Agents](./agents-behaviors)  
4. [Navigation & Router](./navigation-router) — bridge pattern with `Router`  
5. [API reference](./api-reference) — package exports  

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
