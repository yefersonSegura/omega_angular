"use strict";

const {
  OMEGA_SETUP_MINIMAL,
  OMEGA_SETUP_WITH_AUTH,
  applyStarterShell,
  mergeOrCreateStarterRoutes,
} = require("./starter-shell");

/**
 * @param {{ project?: string; force?: boolean; minimal?: boolean }} options
 * - `minimal` (default false): only omega-setup + app.config — no auth/home files.
 * @returns {import('@angular-devkit/schematics').Rule}
 */
function ecosystem(options) {
  return (tree, context) => {
    const wsPath = "/angular.json";
    if (!tree.exists(wsPath)) {
      throw new Error("angular.json not found — run the schematic from the directory that contains it (usually the repo or app root).");
    }

    const workspace = JSON.parse(tree.read(wsPath).toString());
    const projectName =
      options.project && String(options.project).trim() !== ""
        ? options.project
        : findDefaultApplicationProject(workspace);

    if (!projectName) {
      throw new Error(
        'No application project found. Pass --project="your-app" to ng generate omega-angular:ecosystem.',
      );
    }

    const proj = workspace.projects?.[projectName];
    if (!proj || proj.projectType !== "application") {
      throw new Error(`Project "${projectName}" is not an application project.`);
    }

    const root = (proj.root || "").replace(/\\/g, "/").replace(/\/$/, "");
    const sourceRoot = (proj.sourceRoot || (root ? `${root}/src` : "src")).replace(/\\/g, "/");
    const appDir = `${sourceRoot}/app`;
    const omegaSetupPath = `/${appDir}/omega-setup.ts`.replace(/\/+/g, "/");
    const appConfigPath = `/${appDir}/app.config.ts`.replace(/\/+/g, "/");

    const minimal = options.minimal === true;
    const omegaTemplate = minimal ? OMEGA_SETUP_MINIMAL : OMEGA_SETUP_WITH_AUTH;

    const exists = tree.exists(omegaSetupPath);
    if (exists && !options.force) {
      context.logger.info(
        `omega-angular: ${trimLeadingSlash(omegaSetupPath)} already exists — skipped (use --force to replace).`,
      );
    } else {
      if (exists && options.force) {
        tree.overwrite(omegaSetupPath, omegaTemplate);
        context.logger.info(`omega-angular: overwritten ${trimLeadingSlash(omegaSetupPath)}.`);
      } else {
        tree.create(omegaSetupPath, omegaTemplate);
        context.logger.info(`omega-angular: created ${trimLeadingSlash(omegaSetupPath)}.`);
      }
    }

    if (!minimal) {
      applyStarterShell(tree, appDir, context);
      mergeOrCreateStarterRoutes(tree, appDir, context);
    } else {
      context.logger.info("omega-angular: minimal ecosystem — skipped auth/home starter files.");
    }

    if (tree.exists(appConfigPath)) {
      const before = tree.read(appConfigPath).toString("utf-8");
      const after = mergeAppConfigProviders(before);
      if (after !== before) {
        tree.overwrite(appConfigPath, after);
        context.logger.info(`omega-angular: merged omegaSetupProviders into ${trimLeadingSlash(appConfigPath)}.`);
      } else if (!before.includes("omegaSetupProviders")) {
        context.logger.warn(
          `omega-angular: could not auto-merge ${trimLeadingSlash(appConfigPath)} — add manually:\n` +
            "  import { omegaSetupProviders } from './omega-setup';\n" +
            "  ...spread omegaSetupProviders inside providers: [].",
        );
      }
    } else {
      context.logger.warn(
        `omega-angular: ${trimLeadingSlash(appConfigPath)} not found — add omegaSetupProviders from './omega-setup' in your bootstrap config.`,
      );
    }

    return tree;
  };
}

function trimLeadingSlash(p) {
  return p.replace(/^\//, "");
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
 * @param {string} content
 * @returns {string}
 */
function mergeAppConfigProviders(content) {
  if (content.includes("omegaSetupProviders")) {
    return content;
  }

  let out = content;
  if (!/\bfrom\s+['"]\.\/omega-setup['"]/.test(out)) {
    out = `import { omegaSetupProviders } from './omega-setup';\n` + out;
  }

  if (/providers:\s*\[[^\]]*\.\.\.omegaSetupProviders/s.test(out)) {
    return out;
  }

  const replaced = out.replace(/providers:\s*\[/, "providers: [\n    ...omegaSetupProviders,\n    ");
  return replaced;
}

module.exports = { ecosystem };
