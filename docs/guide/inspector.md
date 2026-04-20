---
title: Omega Inspector
description: In-app diagnostics for OmegaChannel events, handleIntent traffic, and active flows — Angular alternative to a VM debug service connection.
outline: deep
---

# Omega Inspector

**omega-angular** ships an **in-process inspector** for development: it subscribes to the same **`OmegaChannel`**, instruments **`OmegaFlowManager`**, and shows **flows**, **channel events**, **intents**, and **JSON details** in a dark three-column UI, wired through Angular’s DI (no separate debug VM — everything runs in the browser alongside your app).

## Enable in your app

1. Register **`provideOmegaInspector`** **before** **`provideOmega`** in `providers`:

```typescript
import { provideOmega, provideOmegaInspector } from 'omega-angular';

export const omegaSetupProviders = [
  ...provideOmegaInspector({ broadcastChannel: true }),
  ...provideOmega({
    createFlows: (channel) => [/* ... */],
    bootstrap: ({ manager }) => {
      manager.switchTo('auth');
    },
  }),
];
```

2. **Do not use a Router path** for the inspector — it stays **independent** of navigation. Choose one:

   - **`provideOmegaInspectorFloatingUi()`** — mounts a panel host on `document.body`; toggle with **`Ctrl+Shift+O`** (or **`Cmd+Shift+O`** on macOS). The panel behaves like a desktop window: **drag**, **resize**, and **maximize/restore**.  
   - **`OmegaInspectorPanelComponent`** — embed **`<omega-inspector-panel />`** anywhere in a template if you control layout yourself.  
   - **Console only** — omit the floating UI and rely on **`consoleLog`** + **`window.__OMEGA_INSPECTOR__`**.

```typescript
import {
  provideOmega,
  provideOmegaInspector,
  provideOmegaInspectorFloatingUi,
} from 'omega-angular';

export const omegaSetupProviders = [
  ...provideOmegaInspector({ consoleLog: true, exposeGlobal: true }),
  ...provideOmega({ /* ... */ }),
  ...provideOmegaInspectorFloatingUi(),
];
```

::: tip Example app
This monorepo’s **`projects/example`** uses **`provideOmegaInspectorFloatingUi()`** — press **`Ctrl+Shift+O`** to open/close (no `/inspector` route and no floating button).
:::

## Browser console (Redux-style logging)

This is **not** the [Redux DevTools](https://github.com/reduxjs/redux-devtools) browser extension — omega-angular does not speak that protocol. What you get instead is:

1. **`consoleLog: true`** in **`provideOmegaInspector`** — each **channel event** and **`handleIntent`** is printed with **`console.groupCollapsed`**, labels, and `%c` styling (similar in spirit to **Redux middleware** logging).
2. **`exposeGlobal: true`** (default) — sets **`window.__OMEGA_INSPECTOR__`** so in DevTools you can run:
   - `__OMEGA_INSPECTOR__.getIntentLog()`
   - `__OMEGA_INSPECTOR__.getChannelLog()`
   - `__OMEGA_INSPECTOR__.getActiveFlowIds()`
   - `__OMEGA_INSPECTOR__.setConsoleLog(false)` to silence console output without removing the inspector.
   - `__OMEGA_INSPECTOR__.getConsoleLogEnabled()` to read the flag.

On bootstrap you should see an **`console.info`** line pointing at the global API.

## Options

| Option | Purpose |
| ------ | ------- |
| **`maxEvents`** | Cap for channel + intent log rows (default **500**). |
| **`broadcastChannel`** | If **`true`**, mirrors messages to **`BroadcastChannel('omega-inspector')`** so another tab on the **same origin** can listen (optional custom listener page). |
| **`consoleLog`** | If **`true`**, print each event/intent to the **browser console** (grouped logs). Default **`false`** in the library; the **example app** enables it. |
| **`exposeGlobal`** | If **`true`** (default), attach **`window.__OMEGA_INSPECTOR__`**. Set **`false`** if you only want the UI panel and no global. |

## What you see

| Column | Content |
| ------ | ------- |
| **Flows** | **`getRegisteredFlowIds()`** and which ids are **active** (`switchTo` / `activate`). |
| **Events · Intents** | Every **`OmegaEvent`** on the channel, and every **`handleIntent`** with payload preview. |
| **Details** | JSON for the selected row (full payload / meta). |

## Production builds

Inspector providers are **dev-only by default**: both **`provideOmegaInspector()`** and
**`provideOmegaInspectorFloatingUi()`** return no providers in production (`isDevMode() === false`).

You can still remove them from `providers` for clarity. The **`OmegaInspectorPanelComponent`** is safe to tree-shake if not imported.

If you explicitly need prod diagnostics (not recommended), pass:

```ts
provideOmegaInspector({ allowInProd: true })
provideOmegaInspectorFloatingUi({ allowInProd: true })
```

## API surface

- **`provideOmegaInspector(options?)`** — providers array.  
- **`provideOmegaInspectorFloatingUi()`** — mounts **`OmegaInspectorFloatingComponent`** on `document.body` (no route).  
- **`OmegaInspectorService`** — buffers logs; use if you build a custom UI.  
- **`OmegaInspectorPanelComponent`** — standalone template + styles.  
- **`OmegaInspectorFloatingComponent`** — FAB + panel shell (used by the floating provider).  
- **`OmegaFlowManager.getRegisteredFlowIds()`** / **`getActiveFlowIds()`** — public helpers for other devtools.  
- **`OMEGA_FLOW_MANAGER_INSTRUMENTATION`** — advanced: custom instrumentation object (optional).

## What’s next

- [Cookbook](./cookbook) — end-to-end auth-style flow  
- [Channel & events](./channel-events) — broadcast semantics  
- [Intents, flows & manager](./intents-flows-manager) — `handleIntent`  
