import type { OmegaInspectorChannelEntry, OmegaInspectorIntentEntry } from './omega-inspector.types';

/**
 * Exposed on `window.__OMEGA_INSPECTOR__` when {@link OmegaInspectorService.exposeGlobal} runs
 * (dev / optional). Lets you query logs from the browser console, similar to typing
 * commands against a Redux store inspector.
 */
export interface OmegaInspectorGlobalApi {
  readonly version: 1;
  /** Last buffered channel events (same data as the UI panel). */
  getChannelLog(): readonly OmegaInspectorChannelEntry[];
  /** Last buffered intents from {@link OmegaFlowManager.handleIntent}. */
  getIntentLog(): readonly OmegaInspectorIntentEntry[];
  getRegisteredFlowIds(): readonly string[];
  getActiveFlowIds(): readonly string[];
  clear(): void;
  /** Enable or disable styled `console` output (grouped logs). */
  setConsoleLog(on: boolean): void;
  /** Whether console logging is currently enabled. */
  getConsoleLogEnabled(): boolean;
}

declare global {
  interface Window {
    /** Present when {@link OmegaInspectorService.exposeGlobal} was called (typical dev setup). */
    __OMEGA_INSPECTOR__?: OmegaInspectorGlobalApi;
  }
}

export {};
