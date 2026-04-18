import { Provider } from '@angular/core';
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
 */
export declare function provideOmega(options: OmegaProvideOptions): Provider[];
