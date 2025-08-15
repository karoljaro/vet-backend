import type { OutboxRepository, EventPublisher } from '@/app/_shared/ports';
import type { EventEnvelope } from '@/app/_shared/events';

// TODO(infra): przenieść dispatcher + implementacje outbox/publisher do warstwy infrastruktury.

export class InMemoryOutboxDispatcher {
  constructor(
    private readonly outbox: OutboxRepository,
    private readonly publisher: EventPublisher,
    private readonly batchSize = 100
  ) {}

  async runOnce(): Promise<number> {
    const pending = await this.outbox.listPending(this.batchSize);
    if (pending.length === 0) return 0;

    await this.publisher.publishAll(pending);

    const ids = pending.map((e) => e.envelopeId);
    await this.outbox.markDispatched(ids);
    return pending.length;
  }

  async drain(maxIterations = 100): Promise<number> {
    let total = 0;
    for (let i = 0; i < maxIterations; i++) {
      const n = await this.runOnce();
      total += n;
      if (n === 0) break;
    }
    return total;
  }
}
