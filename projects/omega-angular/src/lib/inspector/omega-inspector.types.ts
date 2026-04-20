import type { OmegaEvent } from '../core/events/omega-event';
import type { OmegaIntent } from '../core/semantics/omega-intent';

export interface OmegaInspectorChannelEntry {
  readonly id: string;
  readonly t: number;
  readonly name: string;
  readonly namespace: string | null;
  /** Active flows at the moment this event was observed by the inspector. */
  readonly deliveredToFlowIds: readonly string[];
  readonly payloadPreview: string;
  readonly raw: OmegaEvent;
}

export interface OmegaInspectorIntentEntry {
  readonly id: string;
  readonly t: number;
  readonly name: string;
  readonly activeFlowIds: readonly string[];
  readonly payloadPreview: string;
  readonly raw: OmegaIntent;
}
