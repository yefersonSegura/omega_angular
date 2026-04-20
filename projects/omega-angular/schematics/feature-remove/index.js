"use strict";
const fs = require("node:fs");
const path = require("node:path");
let ts = null;
try {
  ts = require("typescript");
} catch {
  ts = null;
}

function classify(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  if (!s) {
    throw new Error("omega-angular: feature-remove `name` is required.");
  }
  return s
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function featureFolderName(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  if (!s) {
    throw new Error("omega-angular: invalid feature name.");
  }
  return s.replace(/_/g, "-");
}

function defaultRoutePath(name) {
  const f = featureFolderName(name);
  if (f.endsWith("s")) {
    return f;
  }
  return `${f}s`;
}

function trimLeadingSlash(p) {
  return p.replace(/^\//, "");
}

function toPosix(p) {
  return String(p || "").replace(/\\/g, "/");
}

function formatTypeScriptFile(content, virtualFileName) {
  if (!ts) {
    return content;
  }
  try {
    const sourceFile = ts.createSourceFile(
      virtualFileName || "file.ts",
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    const printed = ts
      .createPrinter({ newLine: ts.NewLineKind.LineFeed })
      .printFile(sourceFile);
    return printed.endsWith("\n") ? printed : `${printed}\n`;
  } catch {
    return content;
  }
}

function findWorkspaceRootFromCwd(cwd) {
  let current = path.resolve(cwd);
  while (true) {
    if (fs.existsSync(path.join(current, "angular.json"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function isSubPathOf(childPath, parentPath) {
  if (!childPath || !parentPath) {
    return false;
  }
  const rel = path.posix.relative(parentPath, childPath);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

function findDefaultApplicationProject(workspace) {
  const projects = workspace.projects || {};
  for (const n of Object.keys(projects)) {
    if (projects[n].projectType === "application") {
      return n;
    }
  }
  return null;
}

function dirExists(tree, dirPath) {
  const dir = tree.getDir(dirPath);
  return dir.subfiles.length > 0 || dir.subdirs.length > 0;
}

function deleteDirRecursive(tree, dirPath) {
  const dir = tree.getDir(dirPath);
  dir.visit((filePath) => {
    if (tree.exists(filePath)) {
      tree.delete(filePath);
    }
  });
}

function normalizeTreePath(p) {
  return (`/${String(p || "").replace(/\\/g, "/").replace(/^\/+/, "")}`).replace(/\/+/g, "/");
}

function hasLiveFilesOutsideFeature(tree, parentDir, featureDir) {
  const parent = normalizeTreePath(parentDir);
  const feature = normalizeTreePath(featureDir).replace(/\/$/, "");
  let hasOther = false;
  tree.getDir(parent).visit((filePath) => {
    if (hasOther) {
      return;
    }
    const fp = normalizeTreePath(filePath);
    const belongsToFeature = fp === feature || fp.startsWith(`${feature}/`);
    if (!belongsToFeature && tree.exists(fp)) {
      hasOther = true;
    }
  });
  return hasOther;
}

function removeEmptyDirsInTree(tree, rootDir, leafDir) {
  const root = normalizeTreePath(rootDir);
  let current = normalizeTreePath(leafDir);
  while (true) {
    const dir = tree.getDir(current);
    if (dir.subfiles.length === 0 && dir.subdirs.length === 0) {
      tree.delete(current);
    } else {
      break;
    }
    if (current === root) {
      break;
    }
    const parent = current.replace(/\/[^/]+$/, "") || "/";
    if (parent === current) {
      break;
    }
    current = parent;
  }
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeLinesMatching(content, patterns) {
  let out = content;
  for (const p of patterns) {
    out = out.replace(p, "");
  }
  return out;
}

function findMatchingClose(text, start, openChar, closeChar) {
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === openChar) {
      depth += 1;
    } else if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

function findTopLevelRouteObjectByPath(content, targetPath) {
  const decl = content.indexOf("export const routes");
  if (decl === -1) {
    return null;
  }
  const arrStart = content.indexOf("[", decl);
  if (arrStart === -1) {
    return null;
  }
  const arrEnd = findMatchingClose(content, arrStart, "[", "]");
  if (arrEnd === -1) {
    return null;
  }
  const pathRe = new RegExp(`path\\s*:\\s*['"]${escapeRegExp(targetPath)}['"]\\s*,?`);

  let i = arrStart + 1;
  while (i < arrEnd) {
    if (content[i] === "{") {
      const objStart = i;
      const objEnd = findMatchingClose(content, i, "{", "}");
      if (objEnd === -1 || objEnd > arrEnd) {
        return null;
      }
      const objectText = content.slice(objStart, objEnd + 1);
      if (pathRe.test(objectText)) {
        return { start: objStart, end: objEnd };
      }
      i = objEnd + 1;
      continue;
    }
    i += 1;
  }
  return null;
}

function removeRouteObjectFromArrayText(arrayText, routePath) {
  let out = arrayText;
  let arrDepth = 0;
  let objStart = -1;
  let objDepth = 0;
  let removeStart = -1;
  let removeEnd = -1;
  const pathRe = new RegExp(`path\\s*:\\s*['"]${escapeRegExp(routePath)}['"]\\s*,?`);

  for (let i = 0; i < out.length; i += 1) {
    const ch = out[i];
    if (ch === "[") {
      arrDepth += 1;
      continue;
    }
    if (ch === "]") {
      arrDepth -= 1;
      continue;
    }
    if (arrDepth < 1) {
      continue;
    }
    if (objDepth === 0 && ch === "{") {
      objStart = i;
      objDepth = 1;
      continue;
    }
    if (objDepth > 0) {
      if (ch === "{") {
        objDepth += 1;
      } else if (ch === "}") {
        objDepth -= 1;
        if (objDepth === 0 && objStart >= 0) {
          const block = out.slice(objStart, i + 1);
          if (pathRe.test(block)) {
            removeStart = objStart;
            removeEnd = i + 1;
            break;
          }
          objStart = -1;
        }
      }
    }
  }

  if (removeStart < 0) {
    return { changed: false, value: arrayText };
  }

  let start = removeStart;
  let end = removeEnd;
  while (end < out.length && /\s/.test(out[end])) {
    end += 1;
  }
  if (out[end] === ",") {
    end += 1;
  } else {
    let back = start - 1;
    while (back >= 0 && /\s/.test(out[back])) {
      back -= 1;
    }
    if (out[back] === ",") {
      start = back;
    }
  }

  out = out.slice(0, start) + out.slice(end);
  out = out.replace(/\n{3,}/g, "\n\n").replace(/,\s*\]/g, "\n]");
  return { changed: true, value: out };
}

function stripEmptyChildrenProperty(routeObjectText) {
  return routeObjectText
    .replace(/,\s*children\s*:\s*\[\s*\]/m, "")
    .replace(/children\s*:\s*\[\s*\]\s*,?/m, "");
}

function cleanupOmegaSetup(content, p) {
  const featureRootEscaped = escapeRegExp(p.featureRoot);
  const folderEscaped = escapeRegExp(p.folder);
  const flowEscaped = escapeRegExp(p.flowClass);
  const agentEscaped = escapeRegExp(p.agentFn);
  const apiEscaped = escapeRegExp(p.apiClass);

  let out = content.replace(/\r\n/g, "\n");
  out = removeLinesMatching(out, [
    new RegExp(
      `^import\\s+\\{\\s*${apiEscaped}\\s*\\}\\s+from\\s+'\\./${featureRootEscaped}/services/${folderEscaped}\\.api';\\n`,
      "m",
    ),
    new RegExp(
      `^import\\s+\\{\\s*${agentEscaped}\\s*\\}\\s+from\\s+'\\./${featureRootEscaped}/omega/${folderEscaped}\\.agent';\\n`,
      "m",
    ),
    new RegExp(
      `^import\\s+\\{\\s*${flowEscaped}\\s*\\}\\s+from\\s+'\\./${featureRootEscaped}/omega/${folderEscaped}\\.flow';\\n`,
      "m",
    ),
    new RegExp(`^\\s*new\\s+${flowEscaped}\\(channel\\),\\n`, "m"),
    new RegExp(`^\\s*${agentEscaped}\\(channel,\\s*inject\\(${apiEscaped}\\)\\);\\n`, "m"),
  ]);
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}

function cleanupAppRoutes(content, p) {
  let out = content.replace(/\r\n/g, "\n");

  if (p.parentPath) {
    const parentBounds = findTopLevelRouteObjectByPath(out, p.parentPath);
    if (parentBounds) {
      const parentText = out.slice(parentBounds.start, parentBounds.end + 1);
      const childrenIdx = parentText.indexOf("children");
      if (childrenIdx >= 0) {
        const localStart = parentText.indexOf("[", childrenIdx);
        if (localStart >= 0) {
          const localEnd = findMatchingClose(parentText, localStart, "[", "]");
          if (localEnd >= 0) {
            const childrenArray = parentText.slice(localStart, localEnd + 1);
            const removed = removeRouteObjectFromArrayText(childrenArray, p.routePath);
            if (removed.changed) {
              let newParentText =
                parentText.slice(0, localStart) + removed.value + parentText.slice(localEnd + 1);
              newParentText = stripEmptyChildrenProperty(newParentText);
              out = out.slice(0, parentBounds.start) + newParentText + out.slice(parentBounds.end + 1);
              return out.replace(/\n{3,}/g, "\n\n").replace(/,\s*\]/g, "\n]");
            }
          }
        }
      }
    }
  }

  const routesDecl = out.indexOf("export const routes");
  if (routesDecl === -1) {
    return out;
  }
  const arrStart = out.indexOf("[", routesDecl);
  if (arrStart === -1) {
    return out;
  }

  let arrDepth = 1;
  let i = arrStart + 1;
  let objStart = -1;
  let objDepth = 0;
  let removeStart = -1;
  let removeEnd = -1;
  const pathRe = new RegExp(`path\\s*:\\s*'${escapeRegExp(p.routePath)}'\\s*,?`);

  while (i < out.length && arrDepth > 0) {
    const ch = out[i];
    if (ch === "[") {
      arrDepth += 1;
      i += 1;
      continue;
    }
    if (ch === "]") {
      arrDepth -= 1;
      i += 1;
      continue;
    }

    if (objDepth === 0 && ch === "{") {
      objStart = i;
      objDepth = 1;
      i += 1;
      continue;
    }

    if (objDepth > 0) {
      if (ch === "{") {
        objDepth += 1;
      } else if (ch === "}") {
        objDepth -= 1;
        if (objDepth === 0 && objStart >= 0) {
          const objEnd = i;
          const block = out.slice(objStart, objEnd + 1);
          if (pathRe.test(block)) {
            removeStart = objStart;
            removeEnd = objEnd + 1;
            break;
          }
          objStart = -1;
        }
      }
    }
    i += 1;
  }

  if (removeStart >= 0) {
    let start = removeStart;
    let end = removeEnd;

    // Prefer consuming a trailing comma after the removed object.
    while (end < out.length && /\s/.test(out[end])) {
      end += 1;
    }
    if (out[end] === ",") {
      end += 1;
    } else {
      // Otherwise consume a comma before the object.
      let back = start - 1;
      while (back >= 0 && /\s/.test(out[back])) {
        back -= 1;
      }
      if (out[back] === ",") {
        start = back;
      }
    }

    out = out.slice(0, start) + out.slice(end);
  }

  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.replace(/,\s*\]/g, "\n]");
  return out;
}

function cleanupParentRoutesFile(content, p) {
  let out = content;
  const arrStart = out.indexOf("[");
  const arrEnd = arrStart >= 0 ? findMatchingClose(out, arrStart, "[", "]") : -1;
  if (arrStart >= 0 && arrEnd > arrStart) {
    const arrayText = out.slice(arrStart, arrEnd + 1);
    const removed = removeRouteObjectFromArrayText(arrayText, p.routePath);
    if (removed.changed) {
      out = out.slice(0, arrStart) + removed.value + out.slice(arrEnd + 1);
    }
  }
  if (!/canActivate\s*:\s*\[authGuard\]/.test(out)) {
    out = out.replace(/^import\s+\{\s*authGuard\s*\}\s+from\s+['"][^'"]+['"];\n?/m, "");
  }
  out = out.replace(/\n{3,}/g, "\n\n").replace(/,\s*\]/g, "\n]");
  return out;
}

function hasAnyRoutePath(content) {
  return /path\s*:\s*['"][^'"]+['"]/.test(content);
}

function removeParentLoadChildrenRoute(content, parentPath) {
  const parentBounds = findTopLevelRouteObjectByPath(content, parentPath);
  if (!parentBounds) {
    return content;
  }
  const parentObj = content.slice(parentBounds.start, parentBounds.end + 1);
  if (!/loadChildren\s*:/.test(parentObj)) {
    return content;
  }
  let start = parentBounds.start;
  let end = parentBounds.end + 1;
  while (end < content.length && /\s/.test(content[end])) {
    end += 1;
  }
  if (content[end] === ",") {
    end += 1;
  } else {
    let back = start - 1;
    while (back >= 0 && /\s/.test(content[back])) {
      back -= 1;
    }
    if (content[back] === ",") {
      start = back;
    }
  }
  let out = content.slice(0, start) + content.slice(end);
  out = out.replace(/\n{3,}/g, "\n\n").replace(/,\s*\]/g, "\n]");
  return out;
}

/**
 * @param {{ name: string; project?: string; path?: string; parentPath?: string; skipRoute?: boolean; skipOmegaSetup?: boolean }} options
 * @returns {import('@angular-devkit/schematics').Rule}
 */
function featureRemove(options) {
  return (tree, context) => {
    const nameRaw = options.name != null ? String(options.name) : "";
    const folder = featureFolderName(nameRaw);
    const Name = classify(nameRaw);
    const flowClass = `${Name}Flow`;
    const agentFn = `create${Name}Agent`;
    const apiClass = `${Name}Api`;
    const routePath = (options.path && String(options.path).trim()) || defaultRoutePath(folder);
    const parentPath =
      options.parentPath && String(options.parentPath).trim() !== ""
        ? String(options.parentPath).trim()
        : null;
    const parentFolder = parentPath ? featureFolderName(parentPath) : null;

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

    const root = (proj.root || "").replace(/\\/g, "/").replace(/\/$/, "");
    const sourceRoot = (proj.sourceRoot || (root ? `${root}/src` : "src")).replace(/\\/g, "/");
    const appDir = `${sourceRoot}/app`;

    const workspaceRoot = findWorkspaceRootFromCwd(process.cwd());
    const cwdRelativeToWorkspace = workspaceRoot
      ? toPosix(path.relative(workspaceRoot, process.cwd()))
      : "";
    const cwdInsideApp = isSubPathOf(cwdRelativeToWorkspace, appDir);
    const appRelativeCwd = cwdInsideApp
      ? path.posix.relative(appDir, cwdRelativeToWorkspace)
      : "";
    const cwdParts = appRelativeCwd && appRelativeCwd !== "." ? appRelativeCwd.split("/").filter(Boolean) : [];
    if (parentFolder && cwdParts[cwdParts.length - 1] !== parentFolder) {
      cwdParts.push(parentFolder);
    }
    const cwdContainer = cwdParts.join("/");
    const candidateFromCwd =
      cwdContainer
        ? `/${appDir}/${cwdContainer}/${folder}`.replace(/\/+/g, "/")
        : null;
    const fallbackAtRoot = `/${appDir}/${folder}`.replace(/\/+/g, "/");
    const fallbackAtFeatures = `/${appDir}/features/${folder}`.replace(/\/+/g, "/");
    const fallbackAtParent = parentFolder
      ? `/${appDir}/features/${parentFolder}/${folder}`.replace(/\/+/g, "/")
      : null;

    const candidates = [candidateFromCwd, fallbackAtParent, fallbackAtRoot, fallbackAtFeatures].filter(Boolean);
    let featureBase = null;
    for (const candidate of candidates) {
      if (dirExists(tree, candidate)) {
        featureBase = candidate;
        break;
      }
    }
    if (!featureBase) {
      throw new Error(
        `omega-angular: feature folder "${folder}" not found in ${trimLeadingSlash(appDir)} (checked cwd-based path + root + features).`,
      );
    }

    deleteDirRecursive(tree, featureBase);
    // Attempt to remove the feature directory entry itself when empty.
    tree.delete(featureBase);
    context.logger.info(`omega-angular: deleted ${trimLeadingSlash(featureBase)}/.`);

    const featureRoot = trimLeadingSlash(featureBase).replace(`${appDir}/`, "");
    const omegaSetupPath = `/${appDir}/omega-setup.ts`.replace(/\/+/g, "/");
    const appRoutesPath = `/${appDir}/app.routes.ts`.replace(/\/+/g, "/");

    if (!options.skipOmegaSetup && tree.exists(omegaSetupPath)) {
      const before = tree.read(omegaSetupPath).toString("utf-8");
      const after = cleanupOmegaSetup(before, { folder, featureRoot, flowClass, agentFn, apiClass });
      if (after !== before) {
        tree.overwrite(omegaSetupPath, after);
        context.logger.info(
          `omega-angular: removed ${flowClass} + ${agentFn} wiring from ${trimLeadingSlash(omegaSetupPath)}.`,
        );
      }
    }

    if (!options.skipRoute && tree.exists(appRoutesPath)) {
      let shouldRemoveParentLoadChildren = false;
      if (parentPath && parentFolder) {
        const parentRoutesPath = `/${appDir}/features/${parentFolder}/${parentFolder}.routes.ts`.replace(/\/+/g, "/");
        if (tree.exists(parentRoutesPath)) {
          const prBefore = tree.read(parentRoutesPath).toString("utf-8");
          const prAfter = cleanupParentRoutesFile(prBefore, { routePath });
          const prFormatted = formatTypeScriptFile(prAfter, `${parentFolder}.routes.ts`);
          if (prFormatted !== prBefore) {
            if (hasAnyRoutePath(prFormatted)) {
              tree.overwrite(parentRoutesPath, prFormatted);
              context.logger.info(
                `omega-angular: removed child route "${routePath}" from ${trimLeadingSlash(parentRoutesPath)}.`,
              );
            } else {
              tree.delete(parentRoutesPath);
              shouldRemoveParentLoadChildren = true;
              context.logger.info(
                `omega-angular: removed empty parent routes file ${trimLeadingSlash(parentRoutesPath)}.`,
              );
            }
          }
        }
      }

      const before = tree.read(appRoutesPath).toString("utf-8");
      let after = cleanupAppRoutes(before, { folder, featureRoot, routePath, parentPath });
      if (shouldRemoveParentLoadChildren && parentPath) {
        after = removeParentLoadChildrenRoute(after, parentPath);
      }
      const formatted = formatTypeScriptFile(after, "app.routes.ts");
      if (formatted !== before) {
        tree.overwrite(appRoutesPath, formatted);
        context.logger.info(
          `omega-angular: removed lazy route "${routePath}" from ${trimLeadingSlash(appRoutesPath)}.`,
        );
      }
    }

    // Clean empty parent directories in the schematic tree (e.g. features/sales after removing invoice).
    const featureParent = featureBase.replace(/\/[^/]+$/, "") || `/${appDir}`;
    if (!hasLiveFilesOutsideFeature(tree, featureParent, featureBase)) {
      tree.delete(featureParent);
    }
    removeEmptyDirsInTree(tree, `/${appDir}`, featureParent);

    return tree;
  };
}

module.exports = { featureRemove };
