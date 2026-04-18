import { inject, makeEnvironmentProviders, provideAppInitializer, } from '@angular/core';
import { OmegaChannel } from '../core/channel/omega-channel';
import { OmegaFlowManager } from '../flows/omega-flow-manager';
/**
 * Registers {@link OmegaChannel} and {@link OmegaFlowManager}, registers flows,
 * then runs optional bootstrap / agent hooks once the app injector is ready.
 */
export function provideOmega(options) {
    return makeEnvironmentProviders([
        { provide: OmegaChannel, useFactory: () => new OmegaChannel() },
        {
            provide: OmegaFlowManager,
            useFactory: (channel) => {
                const manager = new OmegaFlowManager(channel);
                for (const flow of options.createFlows(channel)) {
                    manager.registerFlow(flow);
                }
                return manager;
            },
            deps: [OmegaChannel],
        },
        provideAppInitializer(() => {
            const channel = inject(OmegaChannel);
            const manager = inject(OmegaFlowManager);
            const ctx = { channel, manager };
            options.bootstrap?.(ctx);
            options.createAgents?.(ctx);
        }),
    ]);
}
