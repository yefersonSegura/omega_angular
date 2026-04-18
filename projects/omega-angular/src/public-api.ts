/*
 * Public API surface of omega-angular.
 * Core layout: core/types, core/events, core/semantics, core/channel.
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
