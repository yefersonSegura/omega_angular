---
title: Overview
description: What omega-angular is, how it fits in an Angular app, and where to go next in this documentation.
outline: deep
---

# Overview

**omega-angular** is a small **Angular + RxJS** library and optional **tooling** (ESLint rules, **eslint-then** builders, **schematics**) that implements the **Omega** architecture: a shared **`OmegaChannel`**, **`OmegaIntent`** requests, **`OmegaFlow`** orchestration, **`OmegaAgent`** side effects, and an **`OmegaFlowManager`** that routes intents to active flows.

::: tip When to read this page
Use this page as the **map of the documentation**. For **concrete problems and solutions**, read [What Omega solves](./what-omega-solves). For **motivation and trade-offs**, read [Vision & why Omega](./vision-and-why).
:::

## What you will use in an app

| Piece | Responsibility |
| ----- | ---------------- |
| **`provideOmega()`** | Registers the channel, flow manager, flows, and optional bootstrap / agents (see [omega-setup.ts](./omega-setup)). |
| **`OmegaFlowManager`** | Routes **`handleIntent`** to every **active** flow; forwards channel events to those flows’ **`onEvent`**. |
| **`OmegaChannel`** | Broadcast bus of **`OmegaEvent`** (no replay). |
| **`OmegaFlow`** | Feature orchestration: validate, emit events; keep HTTP out of the flow when using the recommended layout + ESLint. |
| **`OmegaAgent`** | Listens to **all** channel events and runs **behavior** engines → **reactions** (your code performs HTTP, storage, analytics). |

## Relationship to Angular

Omega **does not replace** Angular primitives such as **`Router`**, **`HttpClient`**, or **`inject()`**. It adds a **collaboration layer** so that UI, flows, and IO stay decoupled behind **intents** and **events**. Typical integration patterns are covered in [Navigation & Router](./navigation-router).

## Source of truth for APIs

This site explains **behavior and patterns**. The **authoritative API list** is the package export surface (`public-api.ts` in the repo) and the **TypeScript declarations** shipped in **`omega-angular`** (including **TSDoc** on public symbols). Use [API reference](./api-reference) as a navigable map.

## What’s next

| Goal | Guide |
| ---- | ----- |
| Problems → Omega answers | [What Omega solves](./what-omega-solves) |
| Copy-paste examples | [Cookbook](./cookbook) |
| Folders & wire tables | [Wire names & feature layout](./wire-names-and-layout) |
| Unit tests | [Testing](./testing) |
| Install and scaffold | [Getting started](./getting-started) |
| Mental model and glossary | [Core concepts](./concepts) |
| End-to-end sequence | [Data flow](./data-flow) |
| Exports cheat sheet | [API reference](./api-reference) |
