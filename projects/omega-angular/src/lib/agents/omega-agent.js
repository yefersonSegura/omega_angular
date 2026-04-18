/** Subscribes to the channel and runs behavior engines per event. */
export class OmegaAgent {
    channel;
    behaviors;
    onReaction;
    subscription;
    constructor(channel, behaviors, onReaction) {
        this.channel = channel;
        this.behaviors = behaviors;
        this.onReaction = onReaction;
        this.subscription = this.channel.events.subscribe((event) => this.tick(event));
    }
    tick(event) {
        const ctx = { event };
        for (const behavior of this.behaviors) {
            const reaction = behavior.evaluate(ctx);
            if (reaction) {
                this.onReaction(reaction);
            }
        }
    }
    destroy() {
        this.subscription?.unsubscribe();
        this.subscription = undefined;
    }
}
