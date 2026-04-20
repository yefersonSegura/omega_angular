import { Subscription } from 'rxjs';

import { OmegaChannel } from '../core/channel/omega-channel';
import type { OmegaEvent } from '../core/events/omega-event';

import type { OmegaAgentBehaviorEngine, OmegaAgentReactionHandler } from './omega-agent-behavior';

export interface OmegaAgentErrorContext {
  readonly phase: 'evaluate' | 'reaction';
  readonly event: OmegaEvent;
  readonly behavior?: OmegaAgentBehaviorEngine;
  readonly reaction?: unknown;
}

export type OmegaAgentErrorHandler = (error: unknown, context: OmegaAgentErrorContext) => void;

/**
 * Side-effect coordinator that listens to **all** {@link OmegaEvent} values on a channel
 * and runs one or more {@link OmegaAgentBehaviorEngine} instances per tick.
 *
 * @remarks
 * Unlike {@link OmegaFlow}, agents are not selected by the {@link OmegaFlowManager}; they
 * subscribe directly. **Each** {@link OmegaAgentBehaviorEngine} runs for every event; any
 * non-null {@link OmegaAgentBehaviorEngine.evaluate} result triggers {@link OmegaAgentReactionHandler}
 * in array order (multiple reactions per event are allowed). Call {@link destroy} when tearing
 * down a session scope to avoid duplicate subscriptions.
 */
export class OmegaAgent {
  private subscription?: Subscription;

  /**
   * @param channel — Source of events (typically the app singleton).
   * @param behaviors — Engines evaluated in array order for every event.
   * @param onReaction — Invoked for each non-null {@link OmegaAgentBehaviorEngine.evaluate} result.
   */
  constructor(
    private readonly channel: OmegaChannel,
    private readonly behaviors: readonly OmegaAgentBehaviorEngine[],
    private readonly onReaction: OmegaAgentReactionHandler,
    private readonly onError?: OmegaAgentErrorHandler,
  ) {
    this.subscription = this.channel.events.subscribe((event) => this.tick(event));
  }

  private tick(event: OmegaEvent): void {
    const ctx = { event };
    for (const behavior of this.behaviors) {
      try {
        const reaction = behavior.evaluate(ctx);
        if (reaction) {
          try {
            this.onReaction(reaction);
          } catch (error) {
            this.onError?.(error, { phase: 'reaction', event, behavior, reaction });
          }
        }
      } catch (error) {
        this.onError?.(error, { phase: 'evaluate', event, behavior });
      }
    }
  }

  /**
   * Unsubscribes from {@link OmegaChannel.events}; the agent must not be used afterward.
   */
  destroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }
}
