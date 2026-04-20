import { InjectionToken } from '@angular/core';

import type { OmegaIntent } from '../core/semantics/omega-intent';

/**
 * Optional hooks for debugging tools (e.g. {@link provideOmegaInspector}).
 * Production apps can omit this entirely.
 */
export interface OmegaFlowManagerInstrumentation {
  /** Called after a flow id is registered. */
  onFlowRegistered?(flowId: string): void;
  /** Called after activate / deactivate / switchTo changes the active set. */
  onActiveSetChanged?(activeFlowIds: readonly string[]): void;
  /** Called when {@link OmegaFlowManager.handleIntent} runs (before flows handle the intent). */
  onIntentHandled?(intent: OmegaIntent, activeFlowIds: readonly string[]): void;
}

/** Injected when {@link provideOmegaInspector} is used together with {@link provideOmega}. */
export const OMEGA_FLOW_MANAGER_INSTRUMENTATION = new InjectionToken<OmegaFlowManagerInstrumentation | undefined>(
  'OMEGA_FLOW_MANAGER_INSTRUMENTATION',
);
