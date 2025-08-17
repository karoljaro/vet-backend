import type { EventEnvelope } from '@/app/_shared/events';
import type { OutboxRepository, TransactionContext } from '@/app/_shared/ports';

// TODO(infra): docelowo przenieść tę implementację do warstwy infrastruktury.

interface StoredEnvelope {
  dispatched: boolean;
  envelope: EventEnvelope;
}

export class InMemoryOutboxRepository implements OutboxRepository {
  private readonly store: StoredEnvelope[] = [];

  async append(envelopes: EventEnvelope[], _ctx?: TransactionContext): Promise<void> {
    for (const e of envelopes) {
      this.store.push({ dispatched: false, envelope: e });
    }
  }

  async listPending(limit = 100, _ctx?: TransactionContext): Promise<EventEnvelope[]> {
    return this.store
      .filter((s) => !s.dispatched)
      .slice(0, limit)
      .map((s) => s.envelope);
  }

  async markDispatched(ids: string[], _ctx?: TransactionContext): Promise<void> {
    const set = new Set(ids);
    for (const s of this.store) {
      if (set.has(s.envelope.envelopeId)) {
        s.dispatched = true;
      }
    }
  }

  // TEST helper
  peek(): { pending: EventEnvelope[]; dispatched: EventEnvelope[] } {
    return {
      pending: this.store.filter((s) => !s.dispatched).map((s) => s.envelope),
      dispatched: this.store.filter((s) => s.dispatched).map((s) => s.envelope),
    };
  }
}
