import { isDevMode, type Provider } from '@angular/core';

import { OMEGA_FLOW_MANAGER_INSTRUMENTATION } from './omega-flow-manager-instrumentation';
import { OmegaInspectorService } from './omega-inspector.service';

export interface OmegaInspectorProvideOptions {
  /** Max rows kept for channel + intent logs (default 500). */
  maxEvents?: number;
  /** If true, mirror traffic to `BroadcastChannel` `omega-inspector` (same origin only). See MDN: BroadcastChannel. */
  broadcastChannel?: boolean;
  /**
   * If true, log each channel event and intent to the browser **console** with grouped, styled
   * output (Redux-middleware style — not the Redux DevTools extension).
   * @default false
   */
  consoleLog?: boolean;
  /**
   * If true (default), set `window.__OMEGA_INSPECTOR__` with `getIntentLog()`, `setConsoleLog()`, etc.
   * @default true
   */
  exposeGlobal?: boolean;
  /**
   * Enable inspector providers in production builds.
   *
   * @remarks
   * Defaults to `false` so inspector instrumentation is dev-only.
   */
  allowInProd?: boolean;
}

/**
 * Dev-only wiring for the Omega Inspector UI: instruments {@link OmegaFlowManager} and
 * subscribes to {@link OmegaChannel} events. Add **before** {@link provideOmega} in `providers`:
 *
 * ```ts
 * providers: [
 *   ...provideOmegaInspector({ broadcastChannel: true }),
 *   ...provideOmega(createOptions()),
 * ]
 * ```
 */
export function provideOmegaInspector(options: OmegaInspectorProvideOptions = {}): Provider[] {
  if (!isDevMode() && !options.allowInProd) {
    return [];
  }
  return [
    OmegaInspectorService,
    {
      provide: OMEGA_FLOW_MANAGER_INSTRUMENTATION,
      useFactory: (inspector: OmegaInspectorService) => {
        if (options.maxEvents != null) {
          inspector.setMaxEvents(options.maxEvents);
        }
        if (options.broadcastChannel) {
          inspector.enableBroadcastChannel();
        }
        if (options.consoleLog) {
          inspector.setConsoleLog(true);
        }
        if (options.exposeGlobal !== false) {
          inspector.exposeGlobal();
        }
        return inspector.createInstrumentation();
      },
      deps: [OmegaInspectorService],
    },
  ];
}
