---
title: Repository layout
description: Monorepo paths for omega-angular, example app, schematics, docs, and npm scripts for contributors.
outline: deep
---

# Repository

The [GitHub repository](https://github.com/yefersonSegura/omega_angular) is a monorepo:

| Path | Role |
| ---- | ---- |
| `projects/omega-angular/` | **Published library** — core types, channel, events, flows, agents, `provideOmega()`. |
| `projects/omega-angular/eslint-then/` | CLI builders: **ESLint first**, then real `serve` / `build`. |
| `projects/omega-angular/eslint-plugin/` | Rules bundled with the published package. |
| `projects/omega-angular/eslint/` | `config-omega.mjs` — `omegaAngularEslintConfigs` for flat ESLint. |
| `projects/omega-angular/schematics/` | `ng add`, `ecosystem`, `feature`. |
| `projects/example/` | Demo application (auth, routes, sample features). |
| `docs/` | **This documentation site** (VitePress). |

## Scripts (root `package.json`)

| Script | Purpose |
| ------ | ------- |
| `npm run start` | Serve the example app (`ng serve example`). |
| `npm run build` | Build the example app. |
| `npm run build:lib` | Lint → `ng build omega-angular` → patch `dist` package `exports`. |
| `npm run docs:dev` / `docs:build` | VitePress documentation. |
| `npm run publish:lib` | Build and `npm publish ./dist/omega-angular` (requires npm login / 2FA). |

## Compatibility

Peers: **Angular ≥ 17**, **RxJS ≥ 7.4**. The example app follows the workspace Angular version.
