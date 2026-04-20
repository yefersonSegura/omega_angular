import { DestroyRef, Injectable, Injector, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OmegaChannel } from '../core/channel/omega-channel';
import type { OmegaEvent } from '../core/events/omega-event';
import type { OmegaIntent } from '../core/semantics/omega-intent';
import { OmegaFlowManager } from '../flows/omega-flow-manager';

import type { OmegaFlowManagerInstrumentation } from './omega-flow-manager-instrumentation';
import type { OmegaInspectorGlobalApi } from './omega-inspector-global';
import type { OmegaInspectorChannelEntry, OmegaInspectorIntentEntry } from './omega-inspector.types';

export type { OmegaInspectorChannelEntry, OmegaInspectorIntentEntry } from './omega-inspector.types';

/** @internal */
export const OMEGA_INSPECTOR_MAX_EVENTS = 500;

@Injectable()
export class OmegaInspectorService {
  private readonly channel = inject(OmegaChannel);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly maxEvents = signal(OMEGA_INSPECTOR_MAX_EVENTS);

  /** Channel events (most recent last). */
  readonly channelLog = signal<readonly OmegaInspectorChannelEntry[]>([]);
  /** Intents passed to {@link OmegaFlowManager.handleIntent}. */
  readonly intentLog = signal<readonly OmegaInspectorIntentEntry[]>([]);

  readonly registeredFlowIds = signal<readonly string[]>([]);
  readonly activeFlowIds = signal<readonly string[]>([]);

  readonly selectedChannelEntry = signal<OmegaInspectorChannelEntry | null>(null);
  readonly selectedIntentEntry = signal<OmegaInspectorIntentEntry | null>(null);

  readonly detailsJson = computed(() => {
    const c = this.selectedChannelEntry();
    const i = this.selectedIntentEntry();
    if (c) {
      return JSON.stringify(
        {
          type: 'channel',
          id: c.id,
          name: c.name,
          namespace: c.namespace,
          deliveredToFlowIds: c.deliveredToFlowIds,
          payload: c.raw.payload,
          meta: c.raw.meta,
        },
        null,
        2,
      );
    }
    if (i) {
      return JSON.stringify(
        {
          type: 'intent',
          id: i.id,
          name: i.name,
          activeFlowIds: i.activeFlowIds,
          payload: i.raw.payload,
          meta: i.raw.meta,
        },
        null,
        2,
      );
    }
    return '';
  });

  private broadcast: BroadcastChannel | null = null;

  /** When true, each channel event / intent is also printed with `console.groupCollapsed` (Redux-style). */
  private consoleLogEnabled = false;

  private globalAttached = false;

  constructor() {
    this.channel.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.appendChannelEvent(event);
    });
    this.refreshFlowListsSoon();
    this.destroyRef.onDestroy(() => this.detachGlobal());
  }

  /** Call from app bootstrap if you want a second tab / static page to listen (same origin). */
  enableBroadcastChannel(name = 'omega-inspector'): void {
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }
    this.broadcast = new BroadcastChannel(name);
  }

  setMaxEvents(n: number): void {
    this.maxEvents.set(Math.max(10, Math.min(10_000, n)));
  }

  /**
   * Print each channel event and intent to the **browser console** using grouped, styled logs
   * (similar in spirit to Redux middleware logging — not the Redux DevTools browser extension).
   */
  setConsoleLog(enabled: boolean): void {
    this.consoleLogEnabled = enabled;
  }

  getConsoleLog(): boolean {
    return this.consoleLogEnabled;
  }

  /**
   * Attaches {@link OmegaInspectorGlobalApi} to `window.__OMEGA_INSPECTOR__` so you can run
   * `__OMEGA_INSPECTOR__.getIntentLog()` from DevTools. No-op on non-browser platforms.
   */
  exposeGlobal(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const api: OmegaInspectorGlobalApi = {
      version: 1,
      getChannelLog: () => this.channelLog(),
      getIntentLog: () => this.intentLog(),
      getRegisteredFlowIds: () => this.registeredFlowIds(),
      getActiveFlowIds: () => this.activeFlowIds(),
      clear: () => this.clearLogs(),
      setConsoleLog: (on) => this.setConsoleLog(on),
      getConsoleLogEnabled: () => this.consoleLogEnabled,
    };
    window.__OMEGA_INSPECTOR__ = api;
    this.globalAttached = true;
    // One-time hint (similar discoverability to Redux-style dev hints)
    if (typeof console !== 'undefined' && console.info) {
      console.info(
        '%cOmega%c · Inspector API → %cwindow.__OMEGA_INSPECTOR__',
        'background:#6e48aa;color:#fff;padding:2px 6px;border-radius:3px',
        '',
        'color:#00d2ff;font-weight:bold',
      );
    }
  }

  private detachGlobal(): void {
    if (typeof window === 'undefined' || !this.globalAttached) {
      return;
    }
    this.globalAttached = false;
    delete window.__OMEGA_INSPECTOR__;
  }

  createInstrumentation(): OmegaFlowManagerInstrumentation {
    return {
      onFlowRegistered: () => this.refreshFlowListsSoon(),
      onActiveSetChanged: () => this.refreshFlowListsSoon(),
      onIntentHandled: (intent, activeFlowIds) => this.appendIntent(intent, activeFlowIds),
    };
  }

  clearLogs(): void {
    this.channelLog.set([]);
    this.intentLog.set([]);
    this.selectedChannelEntry.set(null);
    this.selectedIntentEntry.set(null);
  }

  selectChannelEntry(entry: OmegaInspectorChannelEntry | null): void {
    this.selectedChannelEntry.set(entry);
    this.selectedIntentEntry.set(null);
  }

  selectIntentEntry(entry: OmegaInspectorIntentEntry | null): void {
    this.selectedIntentEntry.set(entry);
    this.selectedChannelEntry.set(null);
  }

  private refreshFlowListsSoon(): void {
    queueMicrotask(() => {
      try {
        const manager = this.injector.get(OmegaFlowManager, null, { optional: true });
        if (manager) {
          this.registeredFlowIds.set(manager.getRegisteredFlowIds());
          this.activeFlowIds.set(manager.getActiveFlowIds());
        }
      } catch {
        /* manager not ready */
      }
    });
  }

  private appendChannelEvent(event: OmegaEvent): void {
    const deliveredToFlowIds = this.getCurrentActiveFlowIds();
    const entry: OmegaInspectorChannelEntry = {
      id: event.id,
      t: Date.now(),
      name: event.name,
      namespace: event.namespace ?? null,
      deliveredToFlowIds,
      payloadPreview: payloadPreview(event.payload),
      raw: event,
    };
    const next = [...this.channelLog(), entry];
    const cap = this.maxEvents();
    if (next.length > cap) {
      next.splice(0, next.length - cap);
    }
    this.channelLog.set(next);
    this.postBroadcast({ kind: 'channel', entry });
    if (this.consoleLogEnabled) {
      logChannelEventToConsole(entry);
    }
  }

  private getCurrentActiveFlowIds(): readonly string[] {
    try {
      const manager = this.injector.get(OmegaFlowManager, null, { optional: true });
      return manager ? manager.getActiveFlowIds() : [];
    } catch {
      return [];
    }
  }

  private appendIntent(intent: OmegaIntent, activeFlowIds: readonly string[]): void {
    const entry: OmegaInspectorIntentEntry = {
      id: intent.id,
      t: Date.now(),
      name: intent.name,
      activeFlowIds: [...activeFlowIds],
      payloadPreview: payloadPreview(intent.payload),
      raw: intent,
    };
    const next = [...this.intentLog(), entry];
    const cap = this.maxEvents();
    if (next.length > cap) {
      next.splice(0, next.length - cap);
    }
    this.intentLog.set(next);
    this.refreshFlowListsSoon();
    this.postBroadcast({ kind: 'intent', entry });
    if (this.consoleLogEnabled) {
      logIntentToConsole(entry);
    }
  }

  private postBroadcast(msg: unknown): void {
    try {
      this.broadcast?.postMessage(msg);
    } catch {
      /* ignore */
    }
  }
}

const CS = {
  label: 'background:#1a1a24;color:#e8e8ef;padding:2px 6px;border-radius:3px;font-weight:600',
  intent: 'color:#c07fd6;font-weight:600',
  event: 'color:#5cefff;font-weight:600',
  dim: 'color:#8b8b9a',
};

function logChannelEventToConsole(entry: OmegaInspectorChannelEntry): void {
  try {
    console.groupCollapsed(
      `%c Omega %c event %c ${entry.name}`,
      CS.label,
      CS.dim,
      CS.event,
    );
    console.log('%cid', CS.dim, entry.id);
    console.log('%cnamespace', CS.dim, entry.namespace);
    console.log('%cdelivered to flows', CS.dim, entry.deliveredToFlowIds);
    console.log('%cpayload', CS.dim, entry.raw.payload);
    console.log('%cmeta', CS.dim, entry.raw.meta);
    console.groupEnd();
  } catch {
    /* ignore */
  }
}

function logIntentToConsole(entry: OmegaInspectorIntentEntry): void {
  try {
    console.groupCollapsed(
      `%c Omega %c intent %c ${entry.name}`,
      CS.label,
      CS.dim,
      CS.intent,
    );
    console.log('%cid', CS.dim, entry.id);
    console.log('%cactive flows', CS.dim, entry.activeFlowIds);
    console.log('%cpayload', CS.dim, entry.raw.payload);
    console.log('%cmeta', CS.dim, entry.raw.meta);
    console.groupEnd();
  } catch {
    /* ignore */
  }
}

function payloadPreview(payload: unknown): string {
  if (payload === undefined) {
    return '';
  }
  try {
    const s = JSON.stringify(payload);
    return s.length > 160 ? `${s.slice(0, 157)}…` : s;
  } catch {
    return String(payload);
  }
}
