import type { AggregateType, EventEnvelope } from '@/app/_shared/events';
import { randomUUID } from 'crypto';
import type { DomainEvent } from '@/domain/shared';
import type { IdGenerator } from '@/app/_shared/ports';

export function mapDomainEventsToEnvelopes(
  events: DomainEvent[],
  aggregateId: string,
  aggregateType: AggregateType,
  opts?: { idGen?: IdGenerator }
): EventEnvelope[] {
  const idGen = opts?.idGen;
  return events.map((e) => ({
    envelopeId: idGen ? idGen.uuid() : randomUUID(),
    type: e.type,
    occurredAt: e.occurredAt,
    aggregateId,
    aggregateType,
  }));
}
