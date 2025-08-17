import { describe, it, expect } from 'vitest';
import { mapDomainEventsToEnvelopes } from '@/app/_shared/mappers/events.mapper';

// Minimal shape matching DomainEvent (type + occurredAt)
interface FakeDomainEvent { type: string; occurredAt: Date }

function ev(type: string, at = new Date()): FakeDomainEvent { return { type, occurredAt: at }; }

describe('mapDomainEventsToEnvelopes', () => {
  it('maps domain events preserving order and metadata', () => {
    const occurred1 = new Date('2024-01-01T10:00:00.000Z');
    const occurred2 = new Date('2024-01-01T10:01:00.000Z');
    const events: FakeDomainEvent[] = [
      ev('OwnerActivated', occurred1),
      ev('OwnerDeactivated', occurred2),
    ];

    const envelopes = mapDomainEventsToEnvelopes(events, 'o-1', 'Owner');

    expect(envelopes.length).toBe(2);
    // order preserved
    expect(envelopes.map(e => e.type)).toEqual(['OwnerActivated', 'OwnerDeactivated']);
    // aggregate meta
    for (const env of envelopes) {
      expect(env.aggregateId).toBe('o-1');
      expect(env.aggregateType).toBe('Owner');
      expect(typeof env.envelopeId).toBe('string');
      expect(env.envelopeId).toHaveLength(36); // uuid v4 length
    }
    // occurredAt propagated
  expect(envelopes[0]!.occurredAt).toBe(occurred1);
  expect(envelopes[1]!.occurredAt).toBe(occurred2);
    // unique ids
  expect(envelopes[0]!.envelopeId).not.toBe(envelopes[1]!.envelopeId);
  });

  it('returns empty array for no events', () => {
    const envelopes = mapDomainEventsToEnvelopes([], 'o-1', 'Owner');
    expect(envelopes).toEqual([]);
  });
});
