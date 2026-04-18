import { APP_INITIALIZER, Provider } from '@angular/core';

import { OmegaChannel } from '../core/channel/omega-channel';
import type { OmegaFlow } from '../flows/omega-flow';
import { OmegaFlowManager } from '../flows/omega-flow-manager';

export interface OmegaRuntimeContext {
  readonly channel: OmegaChannel;
  readonly manager: OmegaFlowManager;
}

export interface OmegaProvideOptions {
  /** Build flows with a shared channel instance. */
  createFlows: (channel: OmegaChannel) => readonly OmegaFlow[];
  /** After flows are registered on the manager (e.g. switchTo / activate). */
  bootstrap?: (ctx: OmegaRuntimeContext) => void;
  /** Optional side-effect agents (session, analytics, …). */
  createAgents?: (ctx: OmegaRuntimeContext) => void;
}

/**
 * Registers {@link OmegaChannel} and {@link OmegaFlowManager}, registers flows,
 * then runs optional bootstrap / agent hooks once the app injector is ready.
 *
 * Returns a plain {@link Provider} array so consumers on Angular 14+ can add it
 * to `NgModule.providers` or `bootstrapApplication` / `ApplicationConfig.providers`.
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
