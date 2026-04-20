import { OmegaChannel } from '../core/channel/omega-channel';
import type { OmegaEvent } from '../core/events/omega-event';
import { OmegaIntent } from '../core/semantics/omega-intent';

import type { OmegaFlow } from './omega-flow';

/**
 * Routes {@link OmegaIntent} instances to **active** flows and forwards every
 * {@link OmegaEvent} on the {@link OmegaChannel} to those flows’ {@link OmegaFlow.onEvent}.
 *
 * @remarks
 * **Construction:** Subscribes to `channel.events` for the lifetime of the manager.
 * Unregister flows by design is not provided; the manager is usually app-scoped.
 *
 * **Active set:** {@link activate} adds a flow id; {@link deactivate} removes one;
 * {@link switchTo} replaces the whole set with a single id (common “one main flow” mode).
 * {@link handleIntent} iterates the active set in insertion order and calls {@link OmegaFlow.onIntent}.
 *
 * **Events:** Each channel event is delivered to every active flow; flows should filter
 * quickly if they only care about a subset of names.
 */
export class OmegaFlowManager {
  private readonly flows = new Map<string, OmegaFlow>();
  private readonly activeFlowIds = new Set<string>();

  /**
   * @param channel — Channel whose `events` stream this manager subscribes to for its whole lifetime.
   *   The subscription is not unsubscribed by the library; align manager and channel lifecycle with the app.
   */
  constructor(private readonly channel: OmegaChannel) {
    this.channel.events.subscribe((event) => this.forwardEventToActiveFlows(event));
  }

  private forwardEventToActiveFlows(event: OmegaEvent): void {
    for (const id of this.activeFlowIds) {
      this.flows.get(id)?.onEvent(event);
    }
  }

  /** @returns The same {@link OmegaChannel} instance passed to the constructor. */
  getChannel(): OmegaChannel {
    return this.channel;
  }

  /**
   * Stores a flow by {@link OmegaFlow.id}. Later calls with the same id replace the previous flow.
   *
   * @param flow — Flow instance; `flow.id` must be stable for activate/switchTo lookups.
   */
  registerFlow(flow: OmegaFlow): void {
    this.flows.set(flow.id, flow);
  }

  /**
   * @deprecated Use {@link registerFlow} instead. Will be removed in a future major version.
   */
  register(flow: OmegaFlow): void {
    this.registerFlow(flow);
  }

  /**
   * Adds a flow id to the active set so it receives intents and channel events.
   *
   * @param flowId — {@link OmegaFlow.id} previously {@link registerFlow registered}.
   */
  activate(flowId: string): void {
    this.activeFlowIds.add(flowId);
  }

  /**
   * Removes a flow id from the active set without disposing the flow instance.
   *
   * @param flowId — Id to remove from the active set; no-op if not active.
   */
  deactivate(flowId: string): void {
    this.activeFlowIds.delete(flowId);
  }

  /**
   * Clears the active set, then activates exactly one flow (typical “current screen flow” pattern).
   *
   * @param flowId — {@link OmegaFlow.id} to make the sole active flow.
   */
  switchTo(flowId: string): void {
    this.activeFlowIds.clear();
    this.activeFlowIds.add(flowId);
  }

  /**
   * Delivers the intent to every active flow, in activation order.
   *
   * @param intent — Typically created with {@link OmegaIntent.fromName}.
   */
  handleIntent(intent: OmegaIntent): void {
    for (const id of this.activeFlowIds) {
      this.flows.get(id)?.onIntent(intent);
    }
  }

  /**
   * @deprecated Use {@link handleIntent} instead. Will be removed in a future major version.
   */
  dispatch(intent: OmegaIntent): void {
    this.handleIntent(intent);
  }
}
