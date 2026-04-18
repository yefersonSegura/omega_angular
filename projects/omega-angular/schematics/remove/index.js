"use strict";

const DEV_DEPS_KEYS = ["eslint", "@eslint/js", "typescript-eslint"];

/** Flat ESLint without omega-angular imports (replaces generated Omega config). */
const MINIMAL_ESLINT_FLAT = `// ESLint flat config (after ng generate omega-angular:remove).
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.angular/**',
      '**/out-tsc/**',
      '**/coverage/**',
      '**/*.d.ts',
    ],
  },
);
`;

function escapeForRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {Record<string, unknown>} serveTarget
 * @param {string} delegateProject
 * @param {string} innerBuildKey
 * @param {string} restoredBuildName
 */
function unpatchServeBuildTargets(serveTarget, delegateProject, innerBuildKey, restoredBuildName) {
  const configs = serveTarget.configurations;
  if (!configs) {
    return;
  }
  const needle = `${delegateProject}:${innerBuildKey}:`;
  const re = new RegExp(escapeForRegex(needle), "g");
  for (const key of Object.keys(configs)) {
    const bt = configs[key].buildTarget;
    if (typeof bt === "string" && bt.includes(needle)) {
      configs[key].buildTarget = bt.replace(re, `${delegateProject}:${restoredBuildName}:`);
    }
  }
}

/**
 * @param {import('@angular-devkit/schematics').Tree} tree
 * @param {string} projectName
 * @returns {boolean}
 */
function unwrapEslintThen(tree, projectName) {
  const angularJsonPath = "/angular.json";
  if (!tree.exists(angularJsonPath)) {
    return false;
  }
  const workspace = JSON.parse(tree.read(angularJsonPath).toString());
  const proj = workspace.projects?.[projectName];
  const arch = proj?.architect;
  if (!arch?.build || !arch?.serve) {
    return false;
  }

  const buildBuilder = arch.build.builder;
  if (typeof buildBuilder !== "string" || !buildBuilder.includes("omega-angular:eslintThenBuild")) {
    return false;
  }

  const innerBuildKey = arch.build.options?.delegateTarget;
  const innerServeKey = arch.serve.options?.delegateTarget;
  const delegateProject = arch.build.options?.delegateProject || projectName;

  if (typeof innerBuildKey !== "string" || typeof innerServeKey !== "string") {
    throw new Error('omega-angular remove: build/serve are missing delegateTarget (cannot unwrap).');
  }

  const innerBuild = arch[innerBuildKey];
  const innerServe = arch[innerServeKey];
  if (!innerBuild || !innerServe) {
    throw new Error(
      `omega-angular remove: inner targets "${innerBuildKey}" / "${innerServeKey}" not found in architect.`,
    );
  }

  const buildRestored = JSON.parse(JSON.stringify(innerBuild));
  const serveRestored = JSON.parse(JSON.stringify(innerServe));
  unpatchServeBuildTargets(serveRestored, delegateProject, innerBuildKey, "build");

  arch.build = buildRestored;
  arch.serve = serveRestored;
  delete arch[innerBuildKey];
  delete arch[innerServeKey];

  tree.overwrite(angularJsonPath, JSON.stringify(workspace, null, 2) + "\n");
  return true;
}

/**
 * @param {string} content
 * @returns {string}
 */
function stripOmegaSetupProviders(content) {
  let out = content.replace(/\r\n/g, "\n");
  out = out.replace(
    /\nimport\s*\{\s*omegaSetupProviders\s*\}\s*from\s*['"][^'"]*\/omega-setup['"]\s*;?\s*/g,
    "\n",
  );
  out = out.replace(/\s*\.\.\.\s*omegaSetupProviders\s*,\s*/g, "");
  out = out.replace(/,\s*\.\.\.\s*omegaSetupProviders\s*/g, "");
  return out;
}

/**
 * @param {import('@angular-devkit/schematics').Tree} tree
 * @param {import('@angular-devkit/schematics').TypedSchematicContext} context
 */
function applyAppConfigCleanup(tree, context, sourceRoot) {
  const rel = `${sourceRoot.replace(/^\//, "")}/app/app.config.ts`.replace(/\/+/g, "/");
  const path = `/${rel}`.replace(/\/+/g, "/");
  if (!tree.exists(path)) {
    context.logger.warn(`omega-angular remove: ${rel} not found — skip app.config cleanup.`);
    return;
  }
  const before = tree.read(path).toString("utf-8");
  if (!before.includes("omegaSetupProviders")) {
    context.logger.info(`omega-angular remove: no omegaSetupProviders in ${rel} — left unchanged.`);
    return;
  }
  const after = stripOmegaSetupProviders(before);
  if (after === before) {
    context.logger.warn(`omega-angular remove: could not strip omegaSetupProviders in ${rel} — edit manually.`);
    return;
  }
  tree.overwrite(path, after);
  context.logger.info(`omega-angular remove: removed omegaSetupProviders from ${rel}.`);
}

/**
 * Workspace root or `project.root` (ng add writes `eslint.config.mjs` at the CLI working tree root).
 * @param {import('@angular-devkit/schematics').Tree} tree
 * @param {import('@angular-devkit/schematics').TypedSchematicContext} context
 * @param {string} projectRoot e.g. `projects/example` or empty
 */
function applyEslintCleanup(tree, context, projectRoot) {
  const candidates = ["/eslint.config.mjs"];
  if (projectRoot) {
    const alt = `/${projectRoot.replace(/^\//, "").replace(/\/$/, "")}/eslint.config.mjs`.replace(/\/+/g, "/");
    if (!candidates.includes(alt)) {
      candidates.push(alt);
    }
  }
  let configPath = null;
  for (const p of candidates) {
    if (tree.exists(p)) {
      configPath = p;
      break;
    }
  }
  if (!configPath) {
    context.logger.info("omega-angular remove: no eslint.config.mjs found — skip ESLint file.");
    return;
  }
  const before = tree.read(configPath).toString("utf-8");
  if (!before.includes("omega-angular") && !before.includes("omegaAngularEslintConfigs")) {
    context.logger.info(
      `omega-angular remove: ${configPath.replace(/^\//, "")} has no omega-angular references — left unchanged.`,
    );
    return;
  }
  tree.overwrite(configPath, MINIMAL_ESLINT_FLAT);
  context.logger.info(
    `omega-angular remove: replaced ${configPath.replace(/^\//, "")} with a minimal flat config (no omega-angular).`,
  );
}

/**
 * @param {import('@angular-devkit/schematics').Tree} tree
 * @param {import('@angular-devkit/schematics').TypedSchematicContext} context
 */
/**
 * @param {import('@angular-devkit/schematics').Tree} tree
 * @param {import('@angular-devkit/schematics').TypedSchematicContext} context
 * @param {string} sourceRoot
 */
function applyOmegaSetupDeletion(tree, context, sourceRoot) {
  const rel = `${sourceRoot.replace(/^\//, "")}/app/omega-setup.ts`.replace(/\/+/g, "/");
  const path = `/${rel}`.replace(/\/+/g, "/");
  if (!tree.exists(path)) {
    context.logger.info(`omega-angular remove: ${rel} not found — skip delete.`);
    return;
  }
  tree.delete(path);
  context.logger.info(`omega-angular remove: deleted ${rel}.`);
}

function applyPackageJsonDevDepsCleanup(tree, context) {
  const path = "/package.json";
  if (!tree.exists(path)) {
    return;
  }
  const pkg = JSON.parse(tree.read(path).toString("utf-8"));
  const dev = pkg.devDependencies;
  if (!dev) {
    return;
  }
  let changed = false;
  for (const key of DEV_DEPS_KEYS) {
    if (dev[key] != null) {
      delete dev[key];
      changed = true;
    }
  }
  if (changed) {
    tree.overwrite(path, JSON.stringify(pkg, null, 2) + "\n");
    context.logger.info("omega-angular remove: removed eslint-related entries from devDependencies.");
  }
}

function findDefaultApplicationProject(workspace) {
  const projects = workspace.projects || {};
  for (const name of Object.keys(projects)) {
    if (projects[name].projectType === "application") {
      return name;
    }
  }
  return null;
}

/**
 * @param {{
 *   project?: string;
 *   skipAngular?: boolean;
 *   skipEslint?: boolean;
 *   skipAppConfig?: boolean;
 *   removeEslintDevDependencies?: boolean;
 *   deleteOmegaSetup?: boolean;
 * }} options
 * @returns {import('@angular-devkit/schematics').Rule}
 */
function removeOmega(options) {
  return (tree, context) => {
    const wsPath = "/angular.json";
    if (!tree.exists(wsPath)) {
      throw new Error("angular.json not found — run this schematic from the workspace root.");
    }

    const workspace = JSON.parse(tree.read(wsPath).toString());
    const projectName =
      options.project && String(options.project).trim() !== ""
        ? options.project
        : findDefaultApplicationProject(workspace);

    if (!projectName) {
      throw new Error('No application project found. Pass --project="your-app".');
    }

    const proj = workspace.projects?.[projectName];
    if (!proj || proj.projectType !== "application") {
      throw new Error(`Project "${projectName}" is not an application project.`);
    }

    const sourceRoot = (proj.sourceRoot || "src").replace(/\\/g, "/").replace(/\/$/, "");
    const projectRoot = (proj.root || "").replace(/\\/g, "/").replace(/\/$/, "");

    if (!options.skipAngular) {
      const did = unwrapEslintThen(tree, projectName);
      if (did) {
        context.logger.info(
          `omega-angular remove: restored build/serve from eslint-then (project "${projectName}").`,
        );
      } else {
        context.logger.info(
          `omega-angular remove: angular.json has no omega-angular:eslintThen* targets — skipped.`,
        );
      }
    }

    if (!options.skipEslint) {
      applyEslintCleanup(tree, context, projectRoot);
    }

    if (!options.skipAppConfig) {
      applyAppConfigCleanup(tree, context, sourceRoot);
    }

    if (options.deleteOmegaSetup) {
      if (options.skipAppConfig) {
        context.logger.warn(
          "omega-angular remove: deleteOmegaSetup ignored because skipAppConfig is set (app.config would still import ./omega-setup).",
        );
      } else {
        applyOmegaSetupDeletion(tree, context, sourceRoot);
      }
    }

    if (options.removeEslintDevDependencies) {
      applyPackageJsonDevDepsCleanup(tree, context);
    }

    const manual =
      options.deleteOmegaSetup === true
        ? "Delete other Omega feature folders manually if you no longer need them. "
        : "Delete `omega-setup.ts` and other Omega files manually if you no longer need them (or re-run with `--delete-omega-setup=true`). ";

    context.logger.warn("Next: run `npm uninstall omega-angular` (or your package manager equivalent). " + manual);

    return tree;
  };
}

module.exports = { removeOmega };
