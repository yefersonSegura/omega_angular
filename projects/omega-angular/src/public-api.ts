/**
 * @packageDocumentation
 * Public API surface of **`omega-angular`**: Omega channel, intents, events, flows,
 * **`OmegaFlowManager`**, agents, and **`provideOmega`**.
 *
 * @remarks
 * Layers (see also the [documentation site](https://yefersonSegura.github.io/omega_angular/)):
 * - **Semantics & types** — wire names, **`OmegaIntent`**, **`OmegaEvent`**, base objects.
 * - **Channel** — **`OmegaChannel`**, **`OmegaChannelNamespace`**, **`OmegaEventBus`**.
 * - **Orchestration** — **`OmegaFlow`**, **`OmegaFlowManager`**, **`OmegaAgent`**.
 * - **Bootstrap** — **`provideOmega`** for `ApplicationConfig` / `NgModule`.
 */

// types
export * from './lib/core/types/omega-object';
export * from './lib/core/types/omega-failure';

// semantics
export * from './lib/core/semantics/omega-event-name';
export * from './lib/core/semantics/omega-intent-name';
export * from './lib/core/semantics/omega-flow-id';
export * from './lib/core/semantics/omega-agent-id';
export * from './lib/core/semantics/omega-semantics-wire-from-camel';
export * from './lib/core/semantics/omega-typed-event';
export * from './lib/core/semantics/omega-intent';

// events
export * from './lib/core/events/omega-event';

// channel
export * from './lib/core/channel/omega-event-bus';
export * from './lib/core/channel/omega-channel';

// flows & agents
export * from './lib/flows/omega-flow';
export * from './lib/flows/omega-flow-manager';
export * from './lib/agents/omega-agent-behavior';
export * from './lib/agents/omega-agent';
export * from './lib/bootstrap/provide-omega';
