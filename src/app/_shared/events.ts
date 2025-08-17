export type AggregateType = 'Patient' | 'Owner';

export interface EventEnvelope {
  readonly envelopeId: string; // unique id for this envelope (not the domain event id)
  readonly type: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly aggregateType: AggregateType;
  readonly aggregateVersion?: number; // version of aggregate AFTER applying the event batch
  readonly payload?: unknown;
}
