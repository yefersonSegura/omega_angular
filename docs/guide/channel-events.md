---
title: Channel & events
description: OmegaChannel, OmegaChannelNamespace, emit paths, namespaces, and disposal — the broadcast event bus for omega-angular.
outline: deep
---

# Channel & events

The **`OmegaChannel`** is a **single broadcast bus**: every emission is observed by subscribers (flows via `OmegaFlowManager`, agents, and any `channel.events.subscribe` you add).

## `OmegaChannel`

- **`events`**: `Observable<OmegaEvent>` — hot stream, **no replay**; subscribers only see events after they subscribe.
- **`emit(event)`** / **`emitNamed(name, payload?)`**: publish an `OmegaEvent`. If the channel was **`dispose()`d**, emits are ignored (optional `onEmitError` in constructor).
- **`emitTyped(typed)`**: wraps a typed payload as the event body (name comes from the typed object).
- **`on(name)`**: shortcut — `events` filtered by `event.name`.
- **`namespace(ns)`**: returns an **`OmegaChannelNamespace`** scoped to that string (see below).
- **`dispose()`**: completes the internal subject; use when tearing down a test or a long-lived subsystem (not usually needed for the root app channel).

## `OmegaChannelNamespace`

Namespaces tag events so subscribers can scope traffic:

- **`emit` / `emitNamed`**: sets `namespace` on the forwarded event.
- **`events`**: still multiplexes from the root channel, but only delivers events whose `namespace` is `null` **or** equals this namespace’s name (so you hear global + your slice).

Use namespaces when several features share wire names and you want isolation without separate channel instances.

## `OmegaEvent`

- Fields: **`id`**, **`name`**, optional **`payload`**, optional **`namespace`**, **`meta`**.
- Factories: **`OmegaEvent.fromName(name, { payload, namespace, … })`**, **`fromJson` / `toJson`** for debugging or persistence.

In handlers, **`event.payloadAs<T>()`** narrows payload type when you control the shape.

## Design tips

1. **Stable wire names** — centralize string constants (see `AuthWire` in the example repo) or use **`OmegaEventName`** / **`OmegaIntentName`**-style enums from your feature module.
2. **Avoid work in constructors** — flows and agents should subscribe in a predictable order (`provideOmega` runs `bootstrap` and `createAgents` after flows are registered).
3. **Errors** — channel `emit` is synchronous push; uncaught errors in subscribers can break the chain; use `onEmitError` on the channel if you need a global safety net.
