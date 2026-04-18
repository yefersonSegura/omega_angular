"use strict";

const { chain } = require("@angular-devkit/schematics");
const { ecosystem } = require("../ecosystem/index");

const ESLINT_CONFIG_MARKER = "omega-angular/eslint/config-omega.mjs";

const DEV_DEPS = {
  eslint: "^9.21.0",
  "@eslint/js": "^9.21.0",
  "typescript-eslint": "^8.24.0",
};

/**
 * @param {{
 *   project?: string;
 *   innerBuildTarget?: string;
 *   innerServeTarget?: string;
 *   skipEslintConfig?: boolean;
 *   skipEcosystem?: boolean;
 *   minimalEcosystem?: boolean;
 * }} options
 * @returns {import('@angular-devkit/schematics').Rule}
 */
function ngAdd(options) {
  return chain([ngAddCore(options), ngAddEcosystemHook(options)]);
}

function ngAddCore(options) {
  return (tree, context) => {
    const angularJsonPath = "/angular.json";
    if (!tree.exists(angularJsonPath)) {
      throw new Error("angular.json not found — run the schematic from the directory that contains it (usually the repo or app root).");
    }

    const workspace = JSON.parse(tree.read(angularJsonPath).toString());
    const projectName =
      options.project && String(options.project).trim() !== ""
        ? options.project
        : findDefaultApplicationProject(workspace);

    if (!projectName) {
      throw new Error(
        'No application project found. Pass --project="your-app" to ng add omega-angular.',
      );
    }

    const innerBuild = options.innerBuildTarget || "app-build";
    const innerServe = options.innerServeTarget || "app-serve";

    const angularChanged = applyEslintThenWrappers(workspace, projectName, innerBuild, innerServe);
    if (angularChanged) {
      tree.overwrite(angularJsonPath, JSON.stringify(workspace, null, 2) + "\n");
      context.logger.info(
        `omega-angular: wrapped "${projectName}" build → ${innerBuild}, serve → ${innerServe} (ESLint first).`,
      );
    } else {
      context.logger.info("omega-angular: serve/build already use eslint-then builders.");
    }

    if (!options.skipEslintConfig) {
      applyEslintLinterSetup(tree, context);
    } else {
      context.logger.info("omega-angular: skipped ESLint config (--skip-eslint-config).");
    }

    return tree;
  };
}

function ngAddEcosystemHook(options) {
  return (tree, context) => {
    if (options.skipEcosystem) {
      context.logger.info("omega-angular: skipped ecosystem bootstrap (--skip-ecosystem).");
      return tree;
    }
    return ecosystem({
      project: options.project,
      force: false,
      minimal: options.minimalEcosystem === true,
    })(tree, context);
  };
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

function applyEslintThenWrappers(workspace, projectName, innerBuildKey, innerServeKey) {
  const proj = workspace.projects?.[projectName];
  const arch = proj?.architect;
  if (!proj || !arch) {
    throw new Error(`Project "${projectName}" has no architect section.`);
  }

  const build = arch.build;
  const serve = arch.serve;

  if (!build || !serve) {
    throw new Error(
      `Project "${projectName}" needs both "build" and "serve" targets (application builder + dev-server).`,
    );
  }

  if (
    typeof build.builder === "string" &&
    (build.builder.includes("omega-angular:eslintThenBuild") ||
      build.builder.includes("@omega-workspace/eslint-then:eslintThenBuild"))
  ) {
    return false;
  }

  if (arch[innerBuildKey] || arch[innerServeKey]) {
    throw new Error(
      `Targets "${innerBuildKey}" or "${innerServeKey}" already exist. Rename/remove them or choose other names via --inner-build-target / --inner-serve-target.`,
    );
  }

  arch[innerBuildKey] = build;
  arch[innerServeKey] = serve;
  patchServeBuildTargets(arch[innerServeKey], projectName, "build", innerBuildKey);

  const buildDefault = build.defaultConfiguration;
  const serveDefault = serve.defaultConfiguration;

  arch.build = {
    builder: "omega-angular:eslintThenBuild",
    options: {
      delegateProject: projectName,
      delegateTarget: innerBuildKey,
    },
    configurations: {
      production: {},
      development: {},
    },
    defaultConfiguration: buildDefault || "production",
  };

  arch.serve = {
    builder: "omega-angular:eslintThenServe",
    options: {
      delegateProject: projectName,
      delegateTarget: innerServeKey,
    },
    configurations: {
      production: {},
      development: {},
    },
    defaultConfiguration: serveDefault || "development",
  };

  return true;
}

function patchServeBuildTargets(serveTarget, projectName, oldBuildName, innerBuildKey) {
  const configs = serveTarget.configurations;
  if (!configs) {
    return;
  }
  for (const key of Object.keys(configs)) {
    const bt = configs[key].buildTarget;
    if (typeof bt === "string") {
      const re = new RegExp(
        "^" + escapeForRegex(projectName) + ":" + escapeForRegex(oldBuildName) + ":",
      );
      if (re.test(bt)) {
        configs[key].buildTarget = bt.replace(
          new RegExp(
            "^" + escapeForRegex(projectName) + ":" + escapeForRegex(oldBuildName) + ":",
          ),
          `${projectName}:${innerBuildKey}:`,
        );
      }
    }
  }
}

function escapeForRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyEslintLinterSetup(tree, context) {
  mergePackageJsonDevDependencies(tree);

  const configPath = "/eslint.config.mjs";
  const jsPath = "/eslint.config.js";

  if (tree.exists(configPath)) {
    const original = tree.read(configPath).toString("utf-8");
    if (original.includes(ESLINT_CONFIG_MARKER)) {
      context.logger.info("omega-angular: eslint.config.mjs already includes Omega rules.");
      return;
    }
    const merged = insertOmegaIntoExistingFlatConfig(original);
    if (merged) {
      tree.overwrite(configPath, merged);
      context.logger.info("omega-angular: merged Omega ESLint configs into eslint.config.mjs.");
    } else {
      context.logger.warn(
        "omega-angular: could not auto-merge eslint.config.mjs (expected export default tseslint.config(...)). " +
          "Add: import { omegaAngularEslintConfigs } from 'omega-angular/eslint/config-omega.mjs' " +
          "and spread ...omegaAngularEslintConfigs inside tseslint.config(...).",
      );
    }
    return;
  }

  if (tree.exists(jsPath)) {
    context.logger.warn(
      "omega-angular: eslint.config.js found; not modified. Use flat eslint.config.mjs or merge manually.",
    );
    return;
  }

  tree.create(configPath, createFreshEslintConfigMjs());
  context.logger.info("omega-angular: created eslint.config.mjs with Omega + typescript-eslint recommended.");
}

function mergePackageJsonDevDependencies(tree) {
  const path = "/package.json";
  if (!tree.exists(path)) {
    return;
  }
  const pkg = JSON.parse(tree.read(path).toString("utf-8"));
  pkg.devDependencies = pkg.devDependencies || {};
  let added = false;
  for (const [name, ver] of Object.entries(DEV_DEPS)) {
    if (pkg.devDependencies[name] == null && pkg.dependencies?.[name] == null) {
      pkg.devDependencies[name] = ver;
      added = true;
    }
  }
  if (added) {
    tree.overwrite(path, JSON.stringify(pkg, null, 2) + "\n");
  }
}

function createFreshEslintConfigMjs() {
  return `// Generated by ng add omega-angular — Omega ESLint (flat config).
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

import { omegaAngularEslintConfigs } from 'omega-angular/eslint/config-omega.mjs';

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
      'projects/omega-angular/**/*.js',
      'projects/omega-angular/eslint-then/**',
      'projects/omega-angular/eslint-plugin/**',
      'projects/omega-angular/eslint/**',
      '**/*.d.ts',
    ],
  },
  ...omegaAngularEslintConfigs,
);
`;
}

function insertOmegaIntoExistingFlatConfig(source) {
  if (source.includes(ESLINT_CONFIG_MARKER)) {
    return source;
  }
  const markerNeedle = "export default tseslint.config(";
  if (!source.includes(markerNeedle)) {
    return null;
  }

  const importLine = `import { omegaAngularEslintConfigs } from 'omega-angular/eslint/config-omega.mjs';\n`;
  let next = source.includes("omega-angular/eslint/config-omega.mjs") ? source : importLine + source;

  const start = next.indexOf(markerNeedle);
  if (start === -1) {
    return null;
  }
  let depth = 0;
  let i = start + markerNeedle.length - 1;
  depth = 1;
  i++;
  for (; i < next.length; i++) {
    const c = next[i];
    if (c === "(") {
      depth++;
    } else if (c === ")") {
      depth--;
      if (depth === 0) {
        return next.slice(0, i) + ", ...omegaAngularEslintConfigs" + next.slice(i);
      }
    }
  }
  return null;
}

module.exports = { ngAdd };
