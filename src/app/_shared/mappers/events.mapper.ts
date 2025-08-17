import type { AggregateType, EventEnvelope } from '@/app/_shared/events';
import { randomUUID } from 'crypto';
import type { DomainEvent } from '@/domain/shared';

export function mapDomainEventsToEnvelopes(
  events: DomainEvent[],
  aggregateId: string,
  aggregateType: AggregateType
): EventEnvelope[] {
  return events.map((e) => ({
    envelopeId: randomUUID(),
    type: e.type,
    occurredAt: e.occurredAt,
    aggregateId,
    aggregateType,
  }));
}
