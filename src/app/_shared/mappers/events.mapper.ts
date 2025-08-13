import type { AggregateType, EventEnvelope } from '@/app/_shared/events';
import type { DomainEvent } from '@/domain/shared';

export function mapDomainEventsToEnvelopes(
  events: DomainEvent[],
  aggregateId: string,
  aggregateType: AggregateType
): EventEnvelope[] {
  return events.map((e) => ({
    type: e.type,
    occurredAt: e.occurredAt,
    aggregateId,
    aggregateType,
  }));
}
