# Vision & why Omega

Omega is an architecture for **large or growing Angular applications** where **user intent**, **feature orchestration**, and **side effects** (HTTP, storage, analytics) should stay **explicit and decoupled**. **omega-angular** brings that model to Angular with a small runtime: **channel**, **intents**, **flows**, **agents**, and optional **tooling** (ESLint, schematics).

The same *ideas* exist for Flutter in **[omega_architecture](https://pub.dev/packages/omega_architecture)** on pub.dev — Omega is a **cross-stack contract**, not only an Angular library.

## Vision

1. **Intent-first** — Everything important a user or subsystem wants to do is expressed as an **`OmegaIntent`** (a name + typed payload). That makes “what happened” readable in logs, tests, and code reviews.

2. **Flows orchestrate, agents execute** — **`OmegaFlow`** classes describe **what should happen next** in a feature (validation, emitting channel events, coordinating steps). **`OmegaAgent`** + **behaviors** turn **events** into **reactions** (call APIs, persist session). Flows stay thin; IO lives where it belongs.

3. **One shared channel** — **`OmegaChannel`** broadcasts **`OmegaEvent`** instances. Flows and agents coordinate **without** importing each other’s concrete classes: they agree on **wire names** and payloads. That reduces coupling as the app adds features and teams.

4. **Explicit activation** — **`OmegaFlowManager`** decides which flows are **active** (`switchTo`, `activate`, …). That makes feature boundaries and “who listens now” a deliberate choice — helpful for navigation-heavy or modular UIs.

5. **Tooling as architecture guardrails** — Lint rules and **eslint-then** builders nudge you toward **services + agents for IO**, **flows for orchestration**, keeping components mostly presentational — so the vision doesn’t erode under deadline pressure.

In short: Omega’s vision is a **structured, event-driven collaboration layer** between UI and the rest of the world, with **clear words** (intents/events) and **clear roles** (flow vs agent).

## Why use omega-angular?

| Reason | Detail |
| ------ | ------ |
| **Scales with features** | Add a feature folder with `omega/` (flow, behaviors, agent) without rewiring the whole app — register in `omega-setup.ts`. |
| **Testability** | Drive flows with **`handleIntent`**; assert **`OmegaChannel`** emissions; mock **`HttpClient`** behind agents — boundaries are explicit. |
| **Aligned teams** | Same vocabulary as **Flutter Omega** where you ship both stacks; comparable mental model for docs and onboarding. |
| **Less “god services”** | Orchestration sits in flows; long if-chains of unrelated concerns are harder to justify when agents and events are the default path. |
| **Shipped tooling** | `ng add omega-angular`, feature/ecosystem schematics, bundled ESLint config — less boilerplate and fewer ad-hoc patterns. |

## When it might be overkill

- **Very small** apps or internal tools with **one** screen and no growth — plain services + signals/components can be enough.
- Teams that **don’t** want event-driven semantics — Omega assumes you’ll name events and route intents deliberately; that has a learning curve.
- If you need **offline-first sync** or **CRDT** as the core model, you may layer Omega on top, but it isn’t a replacement for a domain-specific data layer.

## Where to go next

- **[Core concepts](./concepts)** — glossary and diagrams  
- **[Data flow](./data-flow)** — one path through the system  
- **[Getting started](./getting-started)** — install and first steps  
