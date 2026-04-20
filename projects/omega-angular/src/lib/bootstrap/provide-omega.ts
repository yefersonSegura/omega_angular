import { APP_INITIALIZER, Provider } from '@angular/core';

import { OmegaChannel } from '../core/channel/omega-channel';
import type { OmegaFlow } from '../flows/omega-flow';
import { OmegaFlowManager } from '../flows/omega-flow-manager';

/**
 * Stable handles available during {@link OmegaProvideOptions.bootstrap} and
 * {@link OmegaProvideOptions.createAgents}.
 *
 * @remarks
 * Both services are singletons for the injector that registered `provideOmega`.
 * Use `ctx.manager` to activate flows or dispatch intents from startup code;
 * use `ctx.channel` when agents or bootstrap need to emit or subscribe directly.
 */
export interface OmegaRuntimeContext {
  /** Shared bus for {@link OmegaEvent} traffic between flows and agents. */
  readonly channel: OmegaChannel;
  /** Routes intents to active flows; holds registered {@link OmegaFlow} instances. */
  readonly manager: OmegaFlowManager;
}

/**
 * Configuration for {@link provideOmega}.
 */
export interface OmegaProvideOptions {
  /**
   * Factory that builds every {@link OmegaFlow} for the app, all wired to the same
   * {@link OmegaChannel} instance the library registers.
   *
   * @remarks
   * - **channel** — The injected {@link OmegaChannel}; pass it into each flow’s constructor.
   * - **Return value** — A readonly list of flows; each {@link OmegaFlow.id} must be unique.
   */
  createFlows: (channel: OmegaChannel) => readonly OmegaFlow[];
  /**
   * Optional one-shot hook after flows are {@link OmegaFlowManager.registerFlow registered}
   * on the manager but before the application finishes bootstrapping.
   *
   * @remarks
   * Typical uses: {@link OmegaFlowManager.switchTo}, {@link OmegaFlowManager.activate},
   * seeding session state, or dispatching an initial {@link OmegaIntent}.
   * Runs inside an {@link APP_INITIALIZER}; keep work fast and avoid blocking UI.
   */
  bootstrap?: (ctx: OmegaRuntimeContext) => void;
  /**
   * Optional hook to construct {@link OmegaAgent} instances or other channel listeners
   * that are not modeled as flows.
   *
   * @remarks
   * Runs in the same {@link APP_INITIALIZER} as `bootstrap`, after `bootstrap` if both are set.
   * Prefer constructing agents here so they share the same channel/manager as flows.
   */
  createAgents?: (ctx: OmegaRuntimeContext) => void;
}

/**
 * Registers {@link OmegaChannel} and {@link OmegaFlowManager}, registers all flows from
 * {@link OmegaProvideOptions.createFlows}, then runs optional `bootstrap` / `createAgents`
 * hooks when Angular’s injector is ready.
 *
 * @param options — Flow factory plus optional startup hooks.
 * @returns A {@link Provider} array suitable for `ApplicationConfig.providers` or `NgModule.providers`.
 *
 * @remarks
 * Registration order: `OmegaChannel` → `OmegaFlowManager` (with flows) → `APP_INITIALIZER`
 * that invokes `bootstrap` then `createAgents`. Consumers on **Angular 14+** can spread
 * the result into `providers: [...]`.
 *
 * @see {@link OmegaProvideOptions}
 */
export function provideOmega(options: OmegaProvideOptions): Provider[] {
  return [
    { provide: OmegaChannel, useFactory: () => new OmegaChannel() },
    {
      provide: OmegaFlowManager,
      useFactory: (channel: OmegaChannel) => {
        const manager = new OmegaFlowManager(channel);
        for (const flow of options.createFlows(channel)) {
          manager.registerFlow(flow);
        }
        return manager;
      },
      deps: [OmegaChannel],
    },
    {
      provide: APP_INITIALIZER,
      useFactory:
        (channel: OmegaChannel, manager: OmegaFlowManager) => () => {
          const ctx: OmegaRuntimeContext = { channel, manager };
          options.bootstrap?.(ctx);
          options.createAgents?.(ctx);
        },
      deps: [OmegaChannel, OmegaFlowManager],
      multi: true,
    },
  ];
}
