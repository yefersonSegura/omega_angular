"use strict";

const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { createBuilder, scheduleTargetAndForget } = require("@angular-devkit/architect");
const { defer, of } = require("rxjs");

/** ESLint 9+ does not export `bin/eslint.js` via package "exports"; use the file on disk. */
function eslintCliPath(workspaceRoot) {
  return path.join(workspaceRoot, "node_modules", "eslint", "bin", "eslint.js");
}

function runWorkspaceEslint(workspaceRoot) {
  const eslintBin = eslintCliPath(workspaceRoot);
  const result = spawnSync(process.execPath, [eslintBin, "."], {
    cwd: workspaceRoot,
    stdio: "inherit",
    env: process.env,
  });
  return !result.error && result.status === 0;
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

    if (!runWorkspaceEslint(context.workspaceRoot)) {
      return of({ success: false, error: "ESLint failed." });
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
