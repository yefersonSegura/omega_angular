# ESLint

## Config snippet

Import **`omegaAngularEslintConfigs`** from `omega-angular/eslint/config-omega.mjs` in your root **`eslint.config.mjs`** (flat config).

## Builders

The **`omega-angular:eslintThenBuild`** and **`omega-angular:eslintThenServe`** builders run **`eslint .`** at the **repository root** first, then delegate to your real Angular targets.

## Rules (plugin)

Rules target application code under `src/` and encourage intents/events APIs, keep **HTTP out of `omega/**`**, and reduce **session** and **service coupling** in components. See the repository README for the rule table.
