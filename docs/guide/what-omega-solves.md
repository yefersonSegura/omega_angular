---
title: What Omega solves in Angular
description: Concrete problems in growing Angular apps — coupling, unclear ownership, side effects in components — and how omega-angular addresses them without replacing Angular.
outline: deep
---

# What Omega solves in Angular

**omega-angular** does not replace **`Router`**, **`HttpClient`**, **`signals`**, or **`inject()`**. It adds a **small collaboration layer** so that, as the app grows, you still know **who requests work**, **who orchestrates**, **who performs IO**, and **how features talk** without importing each other’s classes everywhere.

## Problems you may already feel

| Pain | What often happens | Why it hurts |
| ---- | -------------------- | ------------ |
| **Fat components** | Templates call services that call more services; validation, HTTP, and navigation logic pile up in one place. | Hard to test, hard to review, hard to reuse. |
| **“God” services** | One `AppStateService` or `UserService` accumulates unrelated branches. | Every change risks regressions; ownership is unclear. |
| **Hidden coupling** | Feature A imports Feature B’s service to “just send a message”. | Removing or splitting B breaks A; circular deps appear. |
| **Unclear reactions** | “Something” subscribes to a `Subject` in a root service; nobody documents who emits what. | Debugging production flows means grep and hope. |
| **Who is active?** | Many listeners for route or global events; unclear which feature owns the current screen. | Double handling, missed edge cases, or leaks. |

## What Omega adds (in one sentence)

**Named intents** enter through **`OmegaFlowManager` → `OmegaFlow`**. Flows emit **named events** on a shared **`OmegaChannel`**. **`OmegaAgent`** + **behaviors** turn those events into **reactions** (HTTP, storage) and emit results back on the channel. **Activation** (`switchTo` / `activate`) makes “who handles intents and forwarded events now” explicit.

## How each piece maps to the problems

| Piece | Solves |
| ----- | ------ |
| **`OmegaIntent`** | Makes **requests** explicit (`fromName` + payload) — good for logs, tests, and code review. |
| **`OmegaFlow` + `OmegaFlowManager`** | Puts **feature orchestration** in one class per feature id; **only active flows** receive intents and channel forwards. |
| **`OmegaChannel` + `OmegaEvent`** | **Broadcast** collaboration by **wire name** instead of importing peer feature modules. |
| **`OmegaAgent` + behaviors** | Central place for **side effects** (API, `localStorage`) triggered by channel events, keeping flows thin. |
| **Tooling (ESLint, schematics, eslint-then)** | Nudges the **folder layout** and **no-HTTP-in-orchestration** rules so the model survives real deadlines. |

## Minimal mental checklist

1. **User clicked “Login”?** → Component calls **`flowManager.handleIntent(OmegaIntent.fromName(...))`** — not `HttpClient` in the template’s backing code path for business rules.  
2. **Who validates and emits “login requested”?** → **`AuthFlow.onIntent`**.  
3. **Who calls the API?** → **Agent** reaction handler (e.g. after **`AuthLoginBehavior`** returns a reaction).  
4. **Who navigates?** → Flow emits a **navigator** event; **one** bridge in `omega-setup.ts` calls **`Router.navigateByUrl`**.

See the full walkthrough with code in **[Cookbook](./cookbook)** and the sequence diagram in **[Data flow](./data-flow)**.

## When Omega is probably overkill

- A **single** screen or prototype with no planned growth.  
- The team does not want **event names** and **intent names** as a vocabulary (there is a learning curve).  

## What’s next

- **[Cookbook](./cookbook)** — copy-paste patterns from the example app  
- **[Core concepts](./concepts)** — glossary  
- **[Wire names & feature layout](./wire-names-and-layout)** — constants and folders  
- **[Testing](./testing)** — unit-test flows and channel behavior  
