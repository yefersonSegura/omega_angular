"use strict";

/**
 * @param {string} raw
 * @returns {string} PascalCase from kebab/snake (cliente → Cliente, order-item → OrderItem)
 */
function classify(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  if (!s) {
    throw new Error('omega-angular: feature `name` is required (e.g. --name=cliente or `ng g omega-angular:feature cliente`).');
  }
  return s
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * @param {string} raw
 */
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

/** cliente → clientes (very small plural helper for route default). */
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

function findDefaultApplicationProject(workspace) {
  const projects = workspace.projects || {};
  for (const n of Object.keys(projects)) {
    if (projects[n].projectType === "application") {
      return n;
    }
  }
  return null;
}

/**
 * @param {{ name: string; project?: string; path?: string; skipRoute?: boolean; skipOmegaSetup?: boolean }} options
 * @returns {import('@angular-devkit/schematics').Rule}
 */
function feature(options) {
  return (tree, context) => {
    const nameRaw = options.name != null ? String(options.name) : "";
    const folder = featureFolderName(nameRaw);
    const Name = classify(nameRaw);
    if (!folder || !Name) {
      throw new Error('omega-angular: pass a feature name, e.g. `ng generate omega-angular:feature cliente`.');
    }

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
        'No application project found. Pass --project="your-app" to ng generate omega-angular:feature.',
      );
    }

    const proj = workspace.projects?.[projectName];
    if (!proj || proj.projectType !== "application") {
      throw new Error(`Project "${projectName}" is not an application project.`);
    }

    const root = (proj.root || "").replace(/\\/g, "/").replace(/\/$/, "");
    const sourceRoot = (proj.sourceRoot || (root ? `${root}/src` : "src")).replace(/\\/g, "/");
    const appDir = `${sourceRoot}/app`;
    const base = `/${appDir}/${folder}`.replace(/\/+/g, "/");

    const skipRoute = options.skipRoute === true;
    const skipOmegaSetup = options.skipOmegaSetup === true;
    const routePath = (options.path && String(options.path).trim()) || defaultRoutePath(folder);

    const flowClass = `${Name}Flow`;
    const agentFn = `create${Name}Agent`;
    const apiClass = `${Name}Api`;
    const wireExport = `${Name}Wire`;
    const agentActionExport = `${Name}AgentAction`;
    const pageClass = `${Name}PageComponent`;
    const selector = `app-${folder}-page`;

    if (tree.exists(`${base}/omega/${folder}.flow.ts`)) {
      throw new Error(
        `omega-angular: ${trimLeadingSlash(base)}/omega/${folder}.flow.ts already exists — aborting.`,
      );
    }

    tree.create(
      `${base}/models/${folder}.models.ts`,
      modelsTemplate({ folder, Name }),
    );
    tree.create(
      `${base}/services/${folder}.api.ts`,
      apiTemplate({ folder, Name }),
    );
    tree.create(
      `${base}/omega/${folder}.constants.ts`,
      constantsTemplate({ folder, Name, wireExport, agentActionExport }),
    );
    tree.create(`${base}/omega/${folder}.flow.ts`, flowTemplate({ folder, Name, flowClass, wireExport }));
    tree.create(
      `${base}/omega/${folder}.behavior.ts`,
      behaviorTemplate({ folder, Name, wireExport, agentActionExport }),
    );
    tree.create(
      `${base}/omega/${folder}.agent.ts`,
      agentTemplate({ folder, Name, agentFn, apiClass, wireExport, agentActionExport }),
    );
    tree.create(
      `${base}/views/${folder}-page.component.ts`,
      pageTemplate({
        folder,
        Name,
        pageClass,
        selector,
        flowClass,
        wireExport,
        flowId: folder,
      }),
    );
    tree.create(`${base}/views/${folder}-page.component.html`, pageHtmlTemplate({ Name }));
    tree.create(`${base}/views/${folder}-page.component.css`, pageCssTemplate());

    context.logger.info(`omega-angular: created feature at ${trimLeadingSlash(base)}/.`);

    const omegaSetupPath = `/${appDir}/omega-setup.ts`.replace(/\/+/g, "/");
    const appRoutesPath = `/${appDir}/app.routes.ts`.replace(/\/+/g, "/");

    if (!skipOmegaSetup && tree.exists(omegaSetupPath)) {
      const before = tree.read(omegaSetupPath).toString("utf-8");
      const after = mergeOmegaSetup(before, { folder, Name, flowClass, agentFn, apiClass });
      if (after !== before) {
        tree.overwrite(omegaSetupPath, after);
        context.logger.info(`omega-angular: merged ${flowClass} + ${agentFn} into ${trimLeadingSlash(omegaSetupPath)}.`);
      }
    } else if (skipOmegaSetup) {
      context.logger.info("omega-angular: skipped omega-setup.ts (--skip-omega-setup).");
    } else {
      context.logger.warn(`omega-angular: ${trimLeadingSlash(omegaSetupPath)} not found — wire Flow/Agent manually.`);
    }

    if (!skipRoute && tree.exists(appRoutesPath)) {
      const rb = tree.read(appRoutesPath).toString("utf-8");
      const ra = mergeAppRoutes(rb, {
        routePath,
        folder,
        pageClass,
      });
      if (ra !== rb) {
        tree.overwrite(appRoutesPath, ra);
        context.logger.info(
          `omega-angular: registered lazy route "${routePath}" in ${trimLeadingSlash(appRoutesPath)}.`,
        );
      } else if (!ra.includes(`path: '${routePath}'`)) {
        context.logger.warn(
          `omega-angular: could not auto-merge ${trimLeadingSlash(appRoutesPath)} — add a route to ./${folder}/views/${folder}-page.component manually.`,
        );
      }
    } else if (skipRoute) {
      context.logger.info("omega-angular: skipped app.routes.ts (--skip-route).");
    }

    return tree;
  };
}

/**
 * @param {string} content
 * @param {{ folder: string; Name: string; flowClass: string; agentFn: string; apiClass: string }} p
 */
function mergeOmegaSetup(content, p) {
  if (content.includes(`import { ${p.flowClass} }`)) {
    return content;
  }

  const importBlock =
    `import { ${p.apiClass} } from './${p.folder}/services/${p.folder}.api';\n` +
    `import { ${p.agentFn} } from './${p.folder}/omega/${p.folder}.agent';\n` +
    `import { ${p.flowClass} } from './${p.folder}/omega/${p.folder}.flow';\n`;

  let out = content;
  if (!out.includes(`from './${p.folder}/omega/${p.folder}.flow'`)) {
    const afterAuthSession =
      /(import \{ AuthSession \} from '\.\/auth\/omega\/auth\.session';\n)/;
    if (afterAuthSession.test(out)) {
      out = out.replace(afterAuthSession, `$1${importBlock}`);
    } else {
      const anchorImport = /^(import .*\n)+/m;
      out = out.replace(anchorImport, (m) => m + importBlock);
    }
  }

  if (!out.includes(`new ${p.flowClass}(channel)`)) {
    out = out.replace(
      /new AuthFlow\(channel\),\n/,
      `new AuthFlow(channel),\n      new ${p.flowClass}(channel),\n`,
    );
    if (!out.includes(`new ${p.flowClass}(channel)`)) {
      out = out.replace(
        /(createFlows:\s*\(channel:\s*OmegaChannel\)\s*=>\s*\[)/,
        `$1\n      new ${p.flowClass}(channel),`,
      );
    }
  }

  if (!out.includes(`${p.agentFn}(channel`)) {
    out = out.replace(
      /(createAuthAgent\(channel,\s*inject\(AuthApi\)\);)/,
      `$1\n      ${p.agentFn}(channel, inject(${p.apiClass}));`,
    );
    if (!out.includes(`${p.agentFn}(channel`)) {
      out = out.replace(
        /(createAgents:\s*\(\{\s*channel\s*\}\)\s*=>\s*\{)/,
        `$1\n      ${p.agentFn}(channel, inject(${p.apiClass}));`,
      );
    }
  }

  return out;
}

/**
 * @param {string} content
 * @param {{ routePath: string; folder: string; pageClass: string }} p
 */
function mergeAppRoutes(content, p) {
  if (content.includes(`path: '${p.routePath}'`)) {
    return content;
  }
  const block = `  {
    path: '${p.routePath}',
    loadComponent: () =>
      import('./${p.folder}/views/${p.folder}-page.component').then((m) => m.${p.pageClass}),
    canActivate: [authGuard],
  },
`;
  const replaced = content.replace(
    /(\s*)\{\s*path:\s*'\*\*'/,
    `${block}$1{ path: '**'`,
  );
  return replaced;
}

function modelsTemplate(opts) {
  return `export interface ${opts.Name}Row {
  readonly id: string;
  readonly nombre: string;
}

export type ${opts.Name}ListResult =
  | { readonly ok: true; readonly items: readonly ${opts.Name}Row[] }
  | { readonly ok: false; readonly reason: string };
`;
}

function apiTemplate(opts) {
  return `import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import type { ${opts.Name}ListResult, ${opts.Name}Row } from '../models/${opts.folder}.models';

/**
 * Mock list for the Omega demo; real apps replace with HttpClient calls under services/.
 */
@Injectable({ providedIn: 'root' })
export class ${opts.Name}Api {
  list(): Observable<${opts.Name}ListResult> {
    const items: ${opts.Name}Row[] = [
      { id: '1', nombre: 'Acme S.A.' },
      { id: '2', nombre: 'Demo Ltda.' },
    ];
    return of({ ok: true, items } satisfies ${opts.Name}ListResult).pipe(delay(40));
  }
}
`;
}

function constantsTemplate(opts) {
  return `/**
 * Wire names and agent actions for the ${opts.folder} feature (single place for strings).
 */
export const ${opts.wireExport} = {
  intentLoadList: '${opts.folder}.loadList',
  listRequested: '${opts.folder}.list.requested',
  listSuccess: '${opts.folder}.list.success',
  listFailure: '${opts.folder}.list.failure',
} as const;

export const ${opts.agentActionExport} = {
  remoteList: 'remoteList',
} as const;
`;
}

function flowTemplate(opts) {
  return `import { OmegaChannel, OmegaFlow, OmegaIntent } from 'omega-angular';

import { ${opts.wireExport} } from './${opts.folder}.constants';

/** Maps UI intents to channel events (${opts.folder} feature). */
export class ${opts.flowClass} extends OmegaFlow {
  readonly id = '${opts.folder}';

  constructor(channel: OmegaChannel) {
    super(channel);
  }

  override onIntent(intent: OmegaIntent): void {
    if (intent.name !== ${opts.wireExport}.intentLoadList) {
      return;
    }
    this.emit(${opts.wireExport}.listRequested, {});
  }
}
`;
}

function behaviorTemplate(opts) {
  return `import {
  OmegaAgentBehaviorContext,
  OmegaAgentBehaviorEngine,
  OmegaAgentReaction,
} from 'omega-angular';

import { ${opts.agentActionExport}, ${opts.wireExport} } from './${opts.folder}.constants';

export class ${opts.Name}LoadListBehavior extends OmegaAgentBehaviorEngine {
  override evaluate(ctx: OmegaAgentBehaviorContext): OmegaAgentReaction | null {
    if (ctx.event.name === ${opts.wireExport}.listRequested) {
      return { action: ${opts.agentActionExport}.remoteList, payload: {} };
    }
    return null;
  }
}
`;
}

function agentTemplate(opts) {
  return `import { firstValueFrom } from 'rxjs';

import { OmegaAgent, OmegaAgentReaction, OmegaChannel } from 'omega-angular';

import type { ${opts.Name}Api } from '../services/${opts.folder}.api';
import type { ${opts.Name}ListResult } from '../models/${opts.folder}.models';
import { ${opts.Name}LoadListBehavior } from './${opts.folder}.behavior';
import { ${opts.agentActionExport}, ${opts.wireExport} } from './${opts.folder}.constants';

function runRemoteList(channel: OmegaChannel, api: ${opts.Name}Api): void {
  void firstValueFrom(api.list()).then((result: ${opts.Name}ListResult) => {
    if (result.ok) {
      channel.emitNamed(${opts.wireExport}.listSuccess, { items: result.items });
    } else {
      channel.emitNamed(${opts.wireExport}.listFailure, { reason: result.reason });
    }
  });
}

export function ${opts.agentFn}(channel: OmegaChannel, api: ${opts.Name}Api): OmegaAgent {
  return new OmegaAgent(channel, [new ${opts.Name}LoadListBehavior()], (reaction: OmegaAgentReaction) => {
    if (reaction.action === ${opts.agentActionExport}.remoteList) {
      runRemoteList(channel, api);
    }
  });
}
`;
}

function pageTemplate(opts) {
  return `import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OmegaChannel, OmegaFlowManager, OmegaIntent } from 'omega-angular';

import type { ${opts.Name}Row } from '../models/${opts.folder}.models';
import { ${opts.wireExport} } from '../omega/${opts.folder}.constants';

@Component({
  selector: '${opts.selector}',
  imports: [],
  templateUrl: './${opts.folder}-page.component.html',
  styleUrl: './${opts.folder}-page.component.css',
})
export class ${opts.pageClass} {
  private readonly channel = inject(OmegaChannel);
  private readonly flowManager = inject(OmegaFlowManager);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly items = signal<readonly ${opts.Name}Row[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    this.flowManager.activate('${opts.flowId}');

    this.channel
      .on(${opts.wireExport}.listFailure)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.loading.set(false);
        this.error.set(String(ev.payloadAs<{ reason?: string }>()?.reason ?? 'Error'));
      });

    this.channel
      .on(${opts.wireExport}.listSuccess)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.loading.set(false);
        this.error.set(null);
        const payload = ev.payloadAs<{ items?: readonly ${opts.Name}Row[] }>();
        this.items.set(payload?.items ?? []);
      });

    this.flowManager.handleIntent(OmegaIntent.fromName(${opts.wireExport}.intentLoadList, {}));
  }
}
`;
}

function pageHtmlTemplate(opts) {
  return `<div class="wrap">
  <h1>${opts.Name}</h1>
  @if (loading()) {
    <p class="muted">Loading…</p>
  }
  @if (error()) {
    <p class="error" role="alert">{{ error() }}</p>
  }
  @if (!loading() && !error()) {
    <ul>
      @for (c of items(); track c.id) {
        <li>{{ c.nombre }} <span class="meta">({{ c.id }})</span></li>
      }
    </ul>
  }
</div>
`;
}

function pageCssTemplate() {
  return `.wrap {
  max-width: 32rem;
  padding: 1.5rem;
}
.muted {
  opacity: 0.7;
}
.error {
  color: var(--omega-danger, #b00020);
}
.meta {
  opacity: 0.75;
  font-size: 0.875rem;
}
ul {
  margin: 0;
  padding-left: 1.25rem;
}
`;
}

module.exports = { feature };
