import { OmegaChannel } from '../core/channel/omega-channel';
import { OmegaEvent } from '../core/events/omega-event';
import { OmegaIntent } from '../core/semantics/omega-intent';

/** Base class for a flow: handle intents with `onIntent`, channel events with `onEvent`. */
export abstract class OmegaFlow {
  abstract readonly id: string;

  protected constructor(protected readonly channel: OmegaChannel) {}

  abstract onIntent(intent: OmegaIntent): void;

  /**
   * Called for each event on the channel while this flow is active on the
   * {@link OmegaFlowManager}. Default no-op.
   */
  onEvent(_event: OmegaEvent): void {}

  protected emit(
    name: string,
    payload?: Record<string, unknown>,
    namespace?: string | null,
  ): void {
    this.channel.emit(OmegaEvent.fromName(name, { payload, namespace }));
  }
}
