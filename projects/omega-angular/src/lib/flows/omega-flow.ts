import { OmegaChannel } from '../core/channel/omega-channel';
import { OmegaEvent } from '../core/events/omega-event';
import { OmegaIntent } from '../core/semantics/omega-intent';

/**
 * Application feature orchestration unit: receives {@link OmegaIntent} from the
 * {@link OmegaFlowManager} and {@link OmegaEvent} from the shared {@link OmegaChannel}.
 *
 * @remarks
 * Subclasses expose a stable string {@link id} used with {@link OmegaFlowManager.activate},
 * {@link OmegaFlowManager.switchTo}, and registration. Use the protected {@link emit} helper
 * to publish domain events without reaching for the channel directly from deep call stacks.
 */
export abstract class OmegaFlow {
  /**
   * Unique key for registration and activation (e.g. `'auth'`, `'orders'`).
   */
  abstract readonly id: string;

  /**
   * @param channel — Inject and store for {@link emit}; must be the app’s singleton channel.
   */
  protected constructor(protected readonly channel: OmegaChannel) {}

  /**
   * Handle user or system intents while this flow is in the manager’s active set.
   *
   * @param intent — Narrow with {@link OmegaIntent.payloadAs} when needed.
   */
  abstract onIntent(intent: OmegaIntent): void;

  /**
   * Called for each {@link OmegaEvent} on the channel while this flow is active on the
   * {@link OmegaFlowManager}. Override to react to cross-flow or infrastructure events.
   *
   * @param _event — Unused in the default no-op implementation.
   */
  onEvent(_event: OmegaEvent): void {}

  /**
   * Emit a named {@link OmegaEvent} on the injected {@link OmegaChannel}.
   *
   * @param name — Wire event name.
   * @param payload — Optional payload; passed by reference.
   * @param namespace — Optional namespace override; forwarded to {@link OmegaEvent.fromName}.
   */
  protected emit(
    name: string,
    payload?: Record<string, unknown>,
    namespace?: string | null,
  ): void {
    this.channel.emit(OmegaEvent.fromName(name, { payload, namespace }));
  }
}
