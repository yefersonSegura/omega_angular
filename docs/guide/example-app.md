---
title: Example application
description: Reference app in projects/example — omega-setup, auth flow, router bridge, and feature samples.
outline: deep
---

# Example application

`projects/example` is the **reference implementation** in this monorepo. Use it to see how **`omega-setup.ts`**, flows, agents, behaviors, and the **router bridge** fit together.

## What it demonstrates

| Area | Location / notes |
| ---- | ---------------- |
| **Bootstrap** | `src/app/omega-setup.ts` — `createFlows`, `createAgents`, `bootstrap` (`switchTo('auth')`), `provideOmegaNavigationBridge`. |
| **Auth** | `auth/omega/` — `AuthFlow`, behaviors, `createAuthAgent`, wire constants; **`authGuard`**, **`homePageResolver`**. |
| **Navigation** | Subscribes to **`NAVIGATOR_EVENT`** and calls **`Router.navigateByUrl`**. |
| **Other features** | cliente, pedidos, factura — list-style examples from `ng generate omega-angular:feature`. |

## Commands

From the **repository root**:

```bash
npm install
npm run start
```

- **`npm run start`** — `ng serve example` (dev server).  
- **`npm run build`** — production build of the example app.  

This matches the **eslint-then** pipeline you get after **`ng add omega-angular`** in a fresh project.

## Related docs

- [Application bootstrap](./omega-setup)  
- [Data flow](./data-flow)  
- [Repository layout](./repository)  
