---
title: Wire names & feature layout
description: How to name intents and events, organize feature/omega/services/views folders, and let ESLint keep HTTP out of orchestration — documentation in code for Angular teams.
outline: deep
---

# Wire names & feature layout

Omega stays maintainable when **wire names** (intent and event strings) are **stable**, **centralized**, and **discoverable**. This page is the Angular counterpart of having an explicit “surface area” per feature: you express it with **TypeScript constants**, **folder conventions**, and **ESLint** — not a separate runtime contract API.

## Recommended folder shape (per feature)

```
src/app/auth/
├── models/           # DTOs, view models
├── services/       # HttpClient, facades — only here (ESLint can enforce)
├── omega/
│   ├── auth.constants.ts   # AuthWire, AuthAgentAction, NAVIGATOR_EVENT
│   ├── auth.flow.ts
│   ├── auth.agent.ts
│   ├── auth.behavior.ts
│   └── auth.session.ts     # optional thin session helper
└── views/
    └── auth-page.component.ts
```

- **`omega/`** — orchestration (**`OmegaFlow`**), **agents**, **behaviors**, **wire tables**.  
- **`services/`** — **`HttpClient`** and external IO.  
- **`views/`** — components: **`handleIntent`**, **`channel.on(...)`** for UI-bound feedback.

The example app repeats this pattern for **cliente**, **pedidos**, and **factura**.

## Wire tables (`*.constants.ts`)

Define **one object per feature** (or per bounded context) for events and intents:

```typescript
export const AuthWire = {
  intentLogin: 'auth.login',
  loginRequested: 'auth.login.requested',
  success: 'auth.success',
  failure: 'auth.failure',
  logout: 'auth.logout',
} as const;
```

Use **`OmegaIntent.fromName(AuthWire.intentLogin, { payload })`** and **`channel.on(AuthWire.failure)`** everywhere — avoid duplicating raw **`'auth.login'`** strings so renames are mechanical.

::: info ESLint
The **`omega-angular`** plugin can require **`OmegaIntent.fromName`** / event helpers instead of raw constructors. See **[ESLint](./eslint)**.
:::

## Namespacing events (optional)

When several features share one channel, **`channel.namespace('orders')`** tags emissions and filters **`events`** so a listener sees **global** events plus **its** namespace. Use this when subsystems would otherwise collide on generic names.

See **[Channel & events](./channel-events)**.

## Where “documentation in code” lives

| Mechanism | What it documents |
| --------- | ------------------- |
| **`AuthWire` / `PedidosWire`** | Which strings exist for intents and events |
| **`AuthAgentAction`** | Which **`reaction.action`** values the agent handler understands |
| **`OmegaFlow.id`** | Which id **`switchTo`** / **`activate`** use |
| **ESLint `no-http-client-in-orchestration`** | HTTP belongs under **`services/`**, not **`omega/`** |

## What’s next

- **[Cookbook](./cookbook)** — wiring flows and agents with these constants  
- **[Intents, flows & manager](./intents-flows-manager)** — `handleIntent` and activation  
- **[Schematics](./schematics)** — `ng generate omega-angular:feature` scaffolds folders  
