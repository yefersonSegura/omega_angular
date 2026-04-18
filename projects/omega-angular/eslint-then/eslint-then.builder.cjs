"use strict";

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const { createBuilder, scheduleTargetAndForget } = require("@angular-devkit/architect");
const { defer, of } = require("rxjs");

/** ESLint 9+ does not expose `bin/eslint.js` via package "exports"; join from the resolved package root. */
function resolveEslintFromPackageJson(packageJsonPath) {
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }
  try {
    const r = createRequire(packageJsonPath);
    const resolvedPkg = r.resolve("eslint/package.json");
    const bin = path.join(path.dirname(resolvedPkg), "bin", "eslint.js");
    return fs.existsSync(bin) ? bin : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the ESLint CLI: workspace node_modules first, then `eslint` bundled with omega-angular (dependency).
 */
function resolveEslintCli(workspaceRoot) {
  const fromWorkspace = resolveEslintFromPackageJson(path.join(workspaceRoot, "package.json"));
  if (fromWorkspace) {
    return fromWorkspace;
  }
  const fallback = path.join(workspaceRoot, "node_modules", "eslint", "bin", "eslint.js");
  if (fs.existsSync(fallback)) {
    return fallback;
  }
  const omegaPkgJson = path.join(__dirname, "..", "package.json");
  return resolveEslintFromPackageJson(omegaPkgJson);
}

function runWorkspaceEslint(workspaceRoot) {
  const eslintBin = resolveEslintCli(workspaceRoot);
  if (!eslintBin) {
    return { ok: false, missing: true };
  }
  const result = spawnSync(process.execPath, [eslintBin, "."], {
    cwd: workspaceRoot,
    stdio: "inherit",
    env: process.env,
  });
  return { ok: !result.error && result.status === 0, missing: false };
}

/** So we do not override the inner target with undefined (e.g. wipes `tsConfig`). */
function withoutUndefinedValues(input) {
  const out = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

module.exports = createBuilder((options, context) => {
  const delegateProject = options["delegateProject"];
  const delegateTarget = options["delegateTarget"];

  const forward = withoutUndefinedValues({ ...options });
  delete forward["delegateProject"];
  delete forward["delegateTarget"];

  return defer(() => {
    if (typeof delegateProject !== "string" || typeof delegateTarget !== "string") {
      return of({
        success: false,
        error: "eslint-then: delegateProject and delegateTarget (strings) are required.",
      });
    }

    const eslintRun = runWorkspaceEslint(context.workspaceRoot);
    if (!eslintRun.ok) {
      const err = eslintRun.missing
        ? "ESLint is not installed in this workspace. After `ng add omega-angular`, run your package manager install (e.g. `npm install`) so `eslint` is present under node_modules."
        : "ESLint failed.";
      return of({ success: false, error: err });
    }

    return scheduleTargetAndForget(
      context,
      {
        project: delegateProject,
        target: delegateTarget,
        configuration: context.target?.configuration,
      },
      forward,
    );
  });
});
