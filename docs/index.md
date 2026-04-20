---
layout: home

hero:
  name: Omega Angular
  text: Intent, flow, and agent architecture for Angular
  tagline: A shared channel, typed intents, OmegaFlow / OmegaAgent, and first-class tooling — ESLint-before-serve, ng add, and schematics.
  image:
    src: /omega-logo.png
    alt: Omega
  actions:
    - theme: brand
      text: Overview
      link: /guide/overview
    - theme: alt
      text: What Omega solves
      link: /guide/what-omega-solves
    - theme: alt
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Vision & why Omega
      link: /guide/vision-and-why
    - theme: alt
      text: npm package
      link: https://www.npmjs.com/package/omega-angular
    - theme: alt
      text: Source
      link: https://github.com/yefersonSegura/omega_angular

features:
  - title: Vision
    details: Intent-first collaboration — flows orchestrate, agents handle IO, one shared channel. Guardrails via ESLint and schematics keep the model consistent as the app grows.
  - title: OmegaChannel & intents
    details: Broadcast events and route OmegaIntent instances through OmegaFlowManager to your flows.
  - title: Flows & agents
    details: Flows orchestrate feature logic; agents run behaviors and delegate HTTP, storage, and analytics outside views.
  - title: Tooling
    details: eslint-then builders, Omega ESLint rules, ng add omega-angular, ecosystem + feature schematics, remove schematic, and optional login/home starter.
---

## What is this site?

This documentation describes the **[omega-angular](https://www.npmjs.com/package/omega-angular)** npm package and the **[omega_angular](https://github.com/yefersonSegura/omega_angular)** GitHub repository — **Angular only**. The **sidebar** and **top navigation** follow the same *shape* as **[Angular’s documentation](https://angular.dev)** (introduction → essentials → in-depth guides → reference → tooling), adapted to Omega’s smaller surface area.

## How the documentation is organized

| Section | What you will find there |
| ------- | ------------------------ |
| **Introduction** | **[Overview](/guide/overview)**, **[What Omega solves](/guide/what-omega-solves)**, **[Vision & why Omega](/guide/vision-and-why)**, **[About](/guide/about)**. |
| **Essentials** | **[Getting started](/guide/getting-started)**, **[Core concepts](/guide/concepts)**, **[Data flow](/guide/data-flow)**, **[omega-setup.ts](/guide/omega-setup)** — enough to bootstrap a mental model and a project. |
| **In-depth guides** | Channel, intents/flows/manager, agents, **Router** integration, **[Wire names & layout](/guide/wire-names-and-layout)**, **[Cookbook](/guide/cookbook)**, **[Testing](/guide/testing)**. |
| **Reference** | **[API reference](/guide/api-reference)** — export map; **TSDoc on symbols** in the library is authoritative for signatures. |
| **CLI & tooling** | **[Schematics](/guide/schematics)** and **[ESLint](/guide/eslint)** — `ng add`, generators, and lint guardrails. |
| **This repository** | **[Repository layout](/guide/repository)** and the **[Example app](/guide/example-app)** for contributors and local development. |

On each guide page, use **On this page** (outline) for quick jumps — the same idea as Angular’s in-page table of contents.

## Suggested learning path

1. **[Overview](/guide/overview)** — what the library is and how the pieces fit.  
2. **[What Omega solves](/guide/what-omega-solves)** — problems and mapping to intents/flows/agents.  
3. **[Cookbook](/guide/cookbook)** — runnable patterns from the example app.  
4. **[Vision & why Omega](/guide/vision-and-why)** or **[Getting started](/guide/getting-started)** — *why* vs *how to install*.  
5. **[Core concepts](/guide/concepts)** and **[Data flow](/guide/data-flow)**.  
6. Deep dives: **[Channel & events](/guide/channel-events)**, **[Intents, flows & manager](/guide/intents-flows-manager)**, **[Agents & behaviors](/guide/agents-behaviors)**, **[Wire names & layout](/guide/wire-names-and-layout)**, **[Testing](/guide/testing)**.  
7. **[API reference](/guide/api-reference)** while coding.

Monorepo maintenance (`build:lib`, publishing) is covered under **[Repository layout](/guide/repository)** and the README on GitHub.

## Author

**Omega** is developed by **[Yeferson Segura](https://yefersonsegura.com/)** (mobile · web · product-oriented software). More context and links: **[About the author](/guide/about)**.
