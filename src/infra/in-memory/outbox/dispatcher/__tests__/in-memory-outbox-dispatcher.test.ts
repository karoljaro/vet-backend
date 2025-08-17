import { describe, it, expect, vi } from 'vitest';
import { InMemoryOutboxRepository } from '@/infra/in-memory/outbox/in-memory-outbox.repository';
import { InMemoryOutboxDispatcher } from '@/infra/in-memory/outbox/dispatcher/in-memory-outbox-dispatcher';
import type { EventEnvelope } from '@/app/_shared/events';

let _seq = 0;
function nextId() {
  _seq += 1;
  return `env-${_seq}`;
}

function makeEnvelope(overrides: Partial<EventEnvelope> = {}): EventEnvelope {
  return {
    envelopeId: overrides.envelopeId ?? nextId(),
    type: 'TestEvent',
    occurredAt: overrides.occurredAt ?? new Date(),
    aggregateId: overrides.aggregateId ?? 'agg-1',
    aggregateType: overrides.aggregateType ?? 'Patient',
    payload: overrides.payload,
  };
}

describe('InMemoryOutboxDispatcher', () => {
  it('dispatches pending envelopes once and not again', async () => {
    const outbox = new InMemoryOutboxRepository();
    const published: EventEnvelope[] = [];
    const publisher = {
      publishAll: vi.fn(async (envs: EventEnvelope[]) => {
        published.push(...envs);
      }),
    };

    await outbox.append([
      makeEnvelope({ aggregateId: 'a1', occurredAt: new Date(1) }),
      makeEnvelope({ aggregateId: 'a2', occurredAt: new Date(2) }),
    ]);

    const dispatcher = new InMemoryOutboxDispatcher(outbox, publisher, 10);

    const first = await dispatcher.runOnce();
    expect(first).toBe(2);
    expect(published.length).toBe(2);

    const second = await dispatcher.runOnce();
    expect(second).toBe(0);
    expect(published.length).toBe(2); // unchanged

    const peek = outbox.peek();
    expect(peek.pending.length).toBe(0);
    expect(peek.dispatched.length).toBe(2);
  });
});
