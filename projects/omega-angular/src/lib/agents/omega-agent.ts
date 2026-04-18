import { Subscription } from 'rxjs';

import { OmegaChannel } from '../core/channel/omega-channel';
import type { OmegaEvent } from '../core/events/omega-event';

import type { OmegaAgentBehaviorEngine, OmegaAgentReactionHandler } from './omega-agent-behavior';

/** Subscribes to the channel and runs behavior engines per event. */
export class OmegaAgent {
  private subscription?: Subscription;

  constructor(
    private readonly channel: OmegaChannel,
    private readonly behaviors: readonly OmegaAgentBehaviorEngine[],
    private readonly onReaction: OmegaAgentReactionHandler,
  ) {
    this.subscription = this.channel.events.subscribe((event) => this.tick(event));
  }

  private tick(event: OmegaEvent): void {
    const ctx = { event };
    for (const behavior of this.behaviors) {
      const reaction = behavior.evaluate(ctx);
      if (reaction) {
        this.onReaction(reaction);
      }
    }
  }

  destroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }
}
