'use strict';

/**
 * Application paths: any file whose path contains `/src/` (Angular CLI default or monorepo
 * `projects/<app>/src/`), excluding node_modules, dist, omega-angular, and this plugin.
 */

/**
 * @param {string} file Normalized path with /
 */
function isOmegaOrchestrationFile(file) {
  return /\/omega\/[^/]+\.ts$/.test(file) || /\\omega\\[^\\]+\.ts$/.test(file);
}

/**
 * @param {string} file
 */
function isServiceFile(file) {
  return /\/services\/[^/]+\.ts$/.test(file) || /\\services\\[^\\]+\.ts$/.test(file);
}

function isComponentFile(file) {
  return /\.component\.ts$/i.test(file.replace(/\\/g, '/'));
}

/** omega-angular package sources (monorepo folder or npm package) — do not apply app rules here. */
function isOmegaAngularLibraryPath(file) {
  const f = file.replace(/\\/g, '/');
  return f.includes('/projects/omega-angular/') || f.includes('/node_modules/omega-angular/');
}

/** This eslint plugin's own package (monorepo, standalone package, or bundled under omega-angular). */
function isEslintPluginPackagePath(file) {
  const f = file.replace(/\\/g, '/');
  return (
    f.includes('/projects/eslint-plugin-omega-angular/') ||
    f.includes('/node_modules/eslint-plugin-omega-angular/') ||
    f.includes('/omega-angular/eslint-plugin/')
  );
}

/**
 * Application TypeScript that uses Omega: any file under a `src/` tree (default Angular CLI layout
 * at repo root, or `projects/<app>/src/` in a workspace), excluding dependencies and this repo's library.
 */
function isOmegaApplicationSourceFile(file) {
  const f = file.replace(/\\/g, '/');
  if (f.includes('/node_modules/')) {
    return false;
  }
  if (f.includes('/dist/') || f.includes('/out-tsc/') || f.includes('/coverage/')) {
    return false;
  }
  if (isOmegaAngularLibraryPath(f) || isEslintPluginPackagePath(f)) {
    return false;
  }
  return f.includes('/src/');
}

/** Imports from `.../omega/*session*.ts` — persistence helpers in any feature, not for views. */
function isOmegaSessionHelperImportSource(importSource) {
  if (typeof importSource !== 'string') {
    return false;
  }
  const n = importSource.replace(/\\/g, '/');
  return /\/omega\/[^/]*session[^/]*\.ts$/i.test(n);
}

/** Prefer OmegaIntent.fromName over `new OmegaIntent` so IDs and options stay consistent. */
const preferIntentFromName = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use OmegaIntent.fromName(...) instead of `new OmegaIntent`.',
      url: 'https://github.com/angular/angular', // placeholder: link to omega-angular README when published
    },
    schema: [],
    messages: {
      useFromName:
        'Use OmegaIntent.fromName(name, options) instead of `new OmegaIntent` so intents follow Omega conventions.',
    },
  },
  create(context) {
    const file = context.filename.replace(/\\/g, '/');
    if (!isOmegaApplicationSourceFile(file)) {
      return {};
    }
    return {
      NewExpression(node) {
        if (node.callee?.type === 'Identifier' && node.callee.name === 'OmegaIntent') {
          context.report({ node, messageId: 'useFromName' });
        }
      },
    };
  },
};

/** Prefer OmegaEvent.fromName in app code (library may construct OmegaEvent internally). */
const preferEventFromName = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use OmegaEvent.fromName(...) or channel.emitNamed / OmegaFlow.emit instead of `new OmegaEvent`.',
    },
    schema: [],
    messages: {
      useFromName:
        'Prefer OmegaEvent.fromName, channel.emitNamed, or flow.emit(...) instead of `new OmegaEvent` in application code.',
    },
  },
  create(context) {
    const file = context.filename.replace(/\\/g, '/');
    if (!isOmegaApplicationSourceFile(file)) {
      return {};
    }
    return {
      NewExpression(node) {
        if (node.callee?.type === 'Identifier' && node.callee.name === 'OmegaEvent') {
          context.report({ node, messageId: 'useFromName' });
        }
      },
    };
  },
};

/** HTTP belongs in feature services, not in omega/ (flow, agent, behaviors). */
const noHttpClientInOrchestration = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Do not import HttpClient or @angular/common/http under feature omega/ (orchestration only).',
    },
    schema: [],
    messages: {
      noHttp:
        'Omega orchestration (flow, agent, behaviors) should not import HttpClient or @angular/common/http — keep HTTP in services/.',
    },
  },
  create(context) {
    const file = context.filename.replace(/\\/g, '/');
    if (!isOmegaOrchestrationFile(file) || isOmegaAngularLibraryPath(file)) {
      return {};
    }
    return {
      ImportDeclaration(node) {
        const src = node.source?.value;
        if (src === '@angular/common/http') {
          context.report({ node, messageId: 'noHttp' });
        }
      },
    };
  },
};

/** Services talk to APIs; channel wiring belongs in components or omega runtime. */
const noChannelInjectInServices = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Discourage inject(OmegaChannel) in service classes (keep OmegaChannel at UI / omega layer).',
    },
    schema: [],
    messages: {
      noChannel:
        'Avoid inject(OmegaChannel) in services — prefer using the channel from components or from omega setup (agents/flows).',
    },
  },
  create(context) {
    const file = context.filename.replace(/\\/g, '/');
    if (!isServiceFile(file) || !isOmegaApplicationSourceFile(file)) {
      return {};
    }
    return {
      CallExpression(node) {
        if (
          node.callee?.type === 'Identifier' &&
          node.callee.name === 'inject' &&
          node.arguments[0]?.type === 'Identifier' &&
          node.arguments[0].name === 'OmegaChannel'
        ) {
          context.report({ node, messageId: 'noChannel' });
        }
      },
    };
  },
};

/** Vistas: sin HttpClient ni imports de capa API (.component.ts). */
const noHttpClientInComponents = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Components must not use HttpClient or @angular/common/http — delegate to feature services via the agent / flows.',
    },
    schema: [],
    messages: {
      noHttpImport: 'Do not import from @angular/common/http in components — keep HTTP in services/ and call it from the Omega agent.',
      noHttpInject: 'Do not inject HttpClient in components.',
    },
  },
  create(context) {
    const file = context.filename.replace(/\\/g, '/');
    if (!isComponentFile(file) || !isOmegaApplicationSourceFile(file)) {
      return {};
    }
    return {
      ImportDeclaration(node) {
        if (node.source?.value === '@angular/common/http') {
          context.report({ node, messageId: 'noHttpImport' });
        }
      },
      CallExpression(node) {
        if (
          node.callee?.type === 'Identifier' &&
          node.callee.name === 'inject' &&
          node.arguments[0]?.type === 'Identifier' &&
          node.arguments[0].name === 'HttpClient'
        ) {
          context.report({ node, messageId: 'noHttpInject' });
        }
      },
    };
  },
};

/** Imports de valor desde feature services (API) prohibidos en componentes; `import type` permitido. */
const noValueImportFromServicesInComponents = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Components should not import application services (*/services/*) — use OmegaChannel / OmegaFlowManager and intents.',
    },
    schema: [],
    messages: {
      noServiceImport:
        'Do not import from feature `services/` in components (value imports). Use `import type` only if you need a type, or route data / channel events for behavior.',
    },
  },
  create(context) {
    const file = context.filename.replace(/\\/g, '/');
    if (!isComponentFile(file) || !isOmegaApplicationSourceFile(file)) {
      return {};
    }
    return {
      ImportDeclaration(node) {
        if (node.importKind === 'type') {
          return;
        }
        const src = node.source?.value;
        if (typeof src !== 'string') {
          return;
        }
        const normalized = src.replace(/\\/g, '/');
        if (normalized.includes('/services/')) {
          context.report({ node, messageId: 'noServiceImport' });
        }
      },
    };
  },
};

/** sessionStorage/localStorage no pertenecen a la vista — resolver, agente o canal. */
const noWebStorageInComponents = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Components should not touch sessionStorage or localStorage directly.',
    },
    schema: [],
    messages: {
      noStorage:
        'Avoid sessionStorage/localStorage in components — persist via Omega agents or read via route resolve/guards.',
    },
  },
  create(context) {
    const file = context.filename.replace(/\\/g, '/');
    if (!isComponentFile(file) || !isOmegaApplicationSourceFile(file)) {
      return {};
    }
    return {
      MemberExpression(node) {
        const obj = node.object;
        if (obj.type === 'Identifier' && (obj.name === 'sessionStorage' || obj.name === 'localStorage')) {
          context.report({ node, messageId: 'noStorage' });
        }
      },
    };
  },
};

/** NgRx / estado global en la vista. */
const noNgrxImportsInComponents = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Use Omega channel + flows instead of NgRx stores in presentation components.',
    },
    schema: [],
    messages: {
      noNgrx: 'Do not import @ngrx/* in components — prefer Omega intents and channel events.',
    },
  },
  create(context) {
    const file = context.filename.replace(/\\/g, '/');
    if (!isComponentFile(file) || !isOmegaApplicationSourceFile(file)) {
      return {};
    }
    return {
      ImportDeclaration(node) {
        const src = node.source?.value;
        if (typeof src === 'string' && src.startsWith('@ngrx/')) {
          context.report({ node, messageId: 'noNgrx' });
        }
      },
    };
  },
};

/** Importar helpers de persistencia (`*.session.ts` bajo `omega/`) en componentes. */
const noOmegaSessionHelperInComponents = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Do not import feature session/persistence modules from */omega/*session*.ts in *.component.ts — use ResolveFn, guards, agents.',
    },
    schema: [],
    messages: {
      noSessionModule:
        'Do not import session/persistence helpers from feature `omega/` in components — expose data via ResolveFn, guards, or the Omega agent.',
    },
  },
  create(context) {
    const file = context.filename.replace(/\\/g, '/');
    if (!isComponentFile(file) || !isOmegaApplicationSourceFile(file)) {
      return {};
    }
    return {
      ImportDeclaration(node) {
        const src = node.source?.value;
        if (isOmegaSessionHelperImportSource(src)) {
          context.report({ node, messageId: 'noSessionModule' });
        }
      },
    };
  },
};

const plugin = {
  rules: {
    'prefer-intent-from-name': preferIntentFromName,
    'prefer-event-from-name': preferEventFromName,
    'no-http-client-in-orchestration': noHttpClientInOrchestration,
    'no-channel-inject-in-services': noChannelInjectInServices,
    'no-http-client-in-components': noHttpClientInComponents,
    'no-value-import-from-services-in-components': noValueImportFromServicesInComponents,
    'no-web-storage-in-components': noWebStorageInComponents,
    'no-ngrx-in-components': noNgrxImportsInComponents,
    'no-omega-session-helper-in-components': noOmegaSessionHelperInComponents,
  },
  configs: {
    /** Flat config fragment — merge with your eslint.config.mjs */
    recommended: [
      {
        plugins: {},
        rules: {
          'omega-angular/prefer-intent-from-name': 'error',
          'omega-angular/prefer-event-from-name': 'error',
          'omega-angular/no-http-client-in-orchestration': 'error',
          'omega-angular/no-channel-inject-in-services': 'warn',
          'omega-angular/no-http-client-in-components': 'error',
          'omega-angular/no-value-import-from-services-in-components': 'error',
          'omega-angular/no-web-storage-in-components': 'error',
          'omega-angular/no-ngrx-in-components': 'error',
          'omega-angular/no-omega-session-helper-in-components': 'error',
        },
      },
    ],
  },
};
plugin.configs.recommended[0].plugins['omega-angular'] = plugin;

module.exports = plugin;
