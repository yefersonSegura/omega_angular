import { OmegaChannel } from '../core/channel/omega-channel';
import type { OmegaEvent } from '../core/events/omega-event';
import { OmegaIntent } from '../core/semantics/omega-intent';

import type { OmegaFlow } from './omega-flow';

/**
 * Routes intents to active flows and forwards channel events to
 * {@link OmegaFlow#onEvent}. Supports `activate` / `switchTo` plus `handleIntent` and `onEvent`.
 */
export class OmegaFlowManager {
  private readonly flows = new Map<string, OmegaFlow>();
  private readonly activeFlowIds = new Set<string>();

  constructor(private readonly channel: OmegaChannel) {
    this.channel.events.subscribe((event) => this.forwardEventToActiveFlows(event));
  }

  private forwardEventToActiveFlows(event: OmegaEvent): void {
    for (const id of this.activeFlowIds) {
      this.flows.get(id)?.onEvent(event);
    }
  }

  getChannel(): OmegaChannel {
    return this.channel;
  }

  registerFlow(flow: OmegaFlow): void {
    this.flows.set(flow.id, flow);
  }

  /** @deprecated Use {@link registerFlow} instead. */
  register(flow: OmegaFlow): void {
    this.registerFlow(flow);
  }

  /** Add a flow to the active set (multi-flow mode). */
  activate(flowId: string): void {
    this.activeFlowIds.add(flowId);
  }

  deactivate(flowId: string): void {
    this.activeFlowIds.delete(flowId);
  }

  /** Single main flow: replace the active set. */
  switchTo(flowId: string): void {
    this.activeFlowIds.clear();
    this.activeFlowIds.add(flowId);
  }

  handleIntent(intent: OmegaIntent): void {
    for (const id of this.activeFlowIds) {
      this.flows.get(id)?.onIntent(intent);
    }
  }

  /** @deprecated Use [handleIntent]. */
  dispatch(intent: OmegaIntent): void {
    this.handleIntent(intent);
  }
}
