export type AggregateType = 'Patient' | 'Owner';

export interface EventEnvelope {
  readonly type: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly aggregateType: AggregateType;
  readonly payload?: unknown;
}
