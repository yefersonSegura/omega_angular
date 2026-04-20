---
title: API reference
description: Map of the omega-angular public API — types, channel, flows, agents, and provideOmega — aligned with public-api.ts and shipped .d.ts files.
outline: deep
---

# API reference (package surface)

This topic lists the **public exports** of **`omega-angular`**. It mirrors how Angular’s docs separate **guides** from a **compact API map**; for parameter-level detail, rely on **TSDoc** in your editor or the **`.d.ts`** files in the published package (see the library’s `public-api.ts` in the repository).

::: info Source of truth
Use this page as a **navigable index**. **TypeScript** declarations under **`node_modules/omega-angular`** (or your monorepo path) are authoritative for signatures and deprecations.
:::

## Types & semantics

| Export area | Contents |
| ----------- | -------- |
| **`OmegaObject`**, **`OmegaFailure`** | Base / error helpers. |
| **`OmegaEventName`**, **`OmegaIntentName`**, **`OmegaFlowId`**, **`OmegaAgentId`** | Branded / enum-like wire identifiers (optional). |
| **`OmegaTypedEvent`** | Typed wrapper for `emitTyped`. |
| **`omegaWireNameFromCamelCaseEnumMember`** | `ordersCreate` → `orders.create` dotted wire names. |

## Intents & events

| Type | Description |
| ---- | ----------- |
| **`OmegaIntent`** | `fromName`, `payloadAs` — routed by **`OmegaFlowManager`**. |
| **`OmegaEvent`** | `fromName`, `fromJson`, `toJson`, `payloadAs`. |

## Channel

| Type | Description |
| ---- | ----------- |
| **`OmegaEventBus`** | Interface implemented by **`OmegaChannel`** and **`OmegaChannelNamespace`**. |
| **`OmegaChannel`** | `events`, `emit`, `emitNamed`, `emitTyped`, `on`, `namespace`, `dispose`. |
| **`OmegaChannelNamespace`** | Scoped emit + filtered **`events` / `on`**. |

## Flows & manager

| Type | Description |
| ---- | ----------- |
| **`OmegaFlow`** | Subclass with **`id`**, **`onIntent`**, **`onEvent`**, protected **`emit`**. |
| **`OmegaFlowManager`** | `registerFlow`, `activate`, `deactivate`, `switchTo`, `handleIntent`, `getChannel`. |

## Agents

| Type | Description |
| ---- | ----------- |
| **`OmegaAgentBehaviorEngine`** | Abstract `evaluate` → reaction or `null`. |
| **`OmegaAgent`** | `(channel, behaviors[], onReaction)`; `destroy`. |

## Bootstrap

| Symbol | Description |
| ------ | ----------- |
| **`provideOmega(options)`** | Returns providers for channel, manager, flows, and an app initializer that runs **`bootstrap`** + **`createAgents`**. |
| **`OmegaProvideOptions`** | `createFlows`, optional `bootstrap`, optional `createAgents`. |
| **`OmegaRuntimeContext`** | `{ channel, manager }` passed to **`bootstrap`** / **`createAgents`**. |

## Inspector (diagnostics)

| Symbol | Description |
| ------ | ----------- |
| **`provideOmegaInspector(options?)`** | **`Provider[]`** — registers **`OmegaInspectorService`** + optional **`OMEGA_FLOW_MANAGER_INSTRUMENTATION`**. Place **before** **`provideOmega`**. |
| **`OmegaInspectorService`** | Buffers channel events + intents; optional **`BroadcastChannel`**. |
| **`OmegaInspectorPanelComponent`** | Standalone UI (**`<omega-inspector-panel />`**). |
| **`OmegaFlowManagerInstrumentation`** | Optional hooks on **`OmegaFlowManager`** (used by the inspector). |
| **`OMEGA_FLOW_MANAGER_INSTRUMENTATION`** | Injection token for custom instrumentation. |
| **`OmegaInspectorGlobalApi`** | Shape of **`window.__OMEGA_INSPECTOR__`** (console API + log getters). |
| **`provideOmegaInspectorFloatingUi()`** | Mounts **`OmegaInspectorFloatingComponent`** on **`document.body`** (no Router). |
| **`OmegaInspectorFloatingComponent`** | Floating **Ω** button + expandable panel shell. |

## Deprecated aliases

- **`register`** → **`registerFlow`**
- **`dispatch`** → **`handleIntent`**

Prefer the non-deprecated names in new code.

## What’s next

- [Getting started](./getting-started) — install and `ng add`
- [Intents, flows & manager](./intents-flows-manager) — how `handleIntent` and active flows work
- [Channel & events](./channel-events) — `OmegaChannel` and namespaces
