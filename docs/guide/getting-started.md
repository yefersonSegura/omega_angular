---
title: Getting started
description: Install omega-angular, run ng add, wire provideOmega, and follow the learning path into the guides and API reference.
outline: deep
---

# Getting started

This topic walks through **installing** the package, **scaffolding** with `ng add`, and **where to read next** — similar in purpose to Angular’s *Getting started* flow for a new workspace.

::: tip New to Omega?
If you are still evaluating fit and trade-offs, read **[Vision & why Omega](./vision-and-why)** or the short **[Overview](./overview)** before restructuring your app.
:::

## Prerequisites

- **Angular CLI** workspace (see [Angular documentation — Local setup](https://angular.dev/installation) for the current recommended versions).
- **Node.js** and **npm** compatible with your Angular version.

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

1. [What Omega solves](./what-omega-solves) — pain points and how the library answers them  
2. [Cookbook](./cookbook) — step-by-step code recipes (auth-style flow)  
3. [Core concepts](./concepts) — glossary and diagram  
4. [Data flow](./data-flow) — intents → flows → channel → agents  
5. [Channel & events](./channel-events), [Intents & flows](./intents-flows-manager), [Agents](./agents-behaviors)  
6. [Wire names & feature layout](./wire-names-and-layout) — `AuthWire`-style tables and folders  
7. [Testing](./testing) — unit-test the channel and flows  
8. [Navigation & Router](./navigation-router) — bridge pattern with `Router`  
9. [API reference](./api-reference) — package exports  

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

## What’s next

| Step | Topic |
| ---- | ----- |
| Mental model | [Core concepts](./concepts) |
| End-to-end path | [Data flow](./data-flow) |
| Bootstrap file | [omega-setup.ts](./omega-setup) |
| Public exports | [API reference](./api-reference) |
