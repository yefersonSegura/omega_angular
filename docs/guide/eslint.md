# ESLint

## Config snippet

Import **`omegaAngularEslintConfigs`** from `omega-angular/eslint/config-omega.mjs` in your root **`eslint.config.mjs`** (flat config).

## Builders

The **`omega-angular:eslintThenBuild`** and **`omega-angular:eslintThenServe`** builders run **`eslint .`** at the **repository root** first, then delegate to your real Angular targets.

## Rules (plugin)

Rules target application code under `src/` and encourage intents/events APIs, keep **HTTP out of `omega/**`**, and reduce **session** and **service coupling** in components. See the repository README for the rule table.

## Removing Omega from ESLint / CLI

`npm uninstall omega-angular` **does not** revert `angular.json` or `eslint.config.mjs`. Use **`ng generate omega-angular:remove`** (optionally with `--delete-omega-setup` and `--remove-eslint-dev-dependencies`) so builders and flat config stop importing the package, then uninstall. Full options: **[Schematics](./schematics)** (section *ng generate omega-angular:remove*).
