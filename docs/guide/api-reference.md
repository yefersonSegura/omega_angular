# API reference (package surface)

Exports from **`omega-angular`** follow this layout (see the library **`public-api.ts`**). Use this page as a map; TypeScript declarations in **`node_modules/omega-angular`** are authoritative.

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
| **`provideOmega(options)`** | Returns **`Provider[]`**: channel, manager, flows, **`APP_INITIALIZER`** for **`bootstrap`** + **`createAgents`**. |
| **`OmegaProvideOptions`** | `createFlows`, optional `bootstrap`, optional `createAgents`. |
| **`OmegaRuntimeContext`** | `{ channel, manager }` passed to **`bootstrap`** / **`createAgents`**. |

## Deprecated aliases

- **`register`** → **`registerFlow`**
- **`dispatch`** → **`handleIntent`**

Prefer the non-deprecated names in new code.
