import type { EventEnvelope } from '@/app/_shared/events';
import type { OutboxRepository, TransactionContext } from '@/app/_shared/ports';

export class InMemoryOutboxRepository implements OutboxRepository {
  private readonly store: EventEnvelope[] = [];

  // TEMP: _ctx for drizzle
  async append(envelopes: EventEnvelope[], _ctx?: TransactionContext): Promise<void> {
    this.store.push(...envelopes);
  }
  // TEST-ONLY helper: inspection of current buffered events
  peek(): EventEnvelope[] {
    return [...this.store];
  }
}
