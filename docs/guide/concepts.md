# Core concepts

## OmegaChannel

A shared **broadcast** stream of `OmegaEvent` instances. Flows and UI subscribe; agents emit results. Use **namespaces** to scope events per feature when useful.

## Intents

`OmegaIntent` describes **what the user or system wants** (e.g. login). The **flow manager** delivers intents to active flows.

## Flows (`OmegaFlow`)

A flow implements `onIntent` and optionally `onEvent`. It **orchestrates** the feature: validates input, emits channel events, and can trigger navigation (e.g. via a `navigator` bridge to the Angular `Router`).

## Agents (`OmegaAgent`)

Agents attach **behaviors** that turn channel events into **reactions** (call API, write session, etc.). Keep **HTTP and storage** in agents / services, not in `omega/` orchestration files — this matches the bundled ESLint rules.

## Flow manager

`OmegaFlowManager` tracks which flows are **active** and dispatches intents and channel traffic. Use `activate`, `switchTo`, etc., according to your routing strategy.
