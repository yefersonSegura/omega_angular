---
title: Data flow
description: End-to-end path from Angular views through OmegaIntent, OmegaFlow, OmegaChannel, and OmegaAgent — with a sequence diagram and layering rules.
outline: deep
---

# Data flow end to end

This topic is the **end-to-end narrative** for a single user action: Angular views → **intents** → **flows** → **channel events** → **agents** (IO) → events back → **flows** / **UI** / **router**. Use it after [Core concepts](./concepts), in the same way you would read an Angular *Essentials* guide that ties several APIs together.

## Mental model

| Piece | Role |
| ----- | ---- |
| **`OmegaIntent`** | “What should happen?” — issued from components or services. |
| **`OmegaFlowManager`** | Sends each intent to every **active** flow’s `onIntent`. |
| **`OmegaFlow`** | Feature orchestration: validate, emit events, no direct HTTP in the flow class (keep IO in agents). |
| **`OmegaChannel`** | Broadcast bus of **`OmegaEvent`** — all listeners see each event (unless you use **namespaces** to narrow). |
| **`OmegaAgent`** | Subscribes to the channel; each **behavior engine** may return a **reaction** per event (multiple engines can react in order); your handler runs IO (API calls, storage). |

## Sequence (login-style example)

```mermaid
sequenceDiagram
  participant View as Component template
  participant Mgr as OmegaFlowManager
  participant Flow as AuthFlow
  participant Ch as OmegaChannel
  participant Agent as Auth agent
  participant API as AuthApi HttpClient

  View->>Mgr: handleIntent(loginIntent)
  Mgr->>Flow: onIntent(intent)
  Flow->>Ch: emit(loginRequested)
  Ch->>Agent: events
  Agent->>API: login HTTP
  API-->>Agent: result
  Agent->>Ch: emitNamed(success or failure)
  Ch->>Flow: onEvent(success)
  Flow->>Ch: emit(navigator path)
  Note over Flow,Ch: Router bridge subscribes and calls navigateByUrl
```

## Where things should live

- **Components**: bind UI to `handleIntent` / read state; avoid `HttpClient` here if your ESLint rules forbid it.
- **`*.flow.ts`**: coordination only — emit events with stable wire names (`AuthWire.*` style in the example).
- **`*.agent.ts` + behaviors**: react to events; run async IO and emit results back on the channel.
- **`omega-setup.ts`**: register all flows and agents, optional `bootstrap` (e.g. `switchTo('auth')`), and infrastructure bridges (e.g. **navigator → Router**).

## What’s next

- [Channel & events](./channel-events)
- [Intents, flows & manager](./intents-flows-manager)
- [Agents & behaviors](./agents-behaviors)
- [API reference](./api-reference)
