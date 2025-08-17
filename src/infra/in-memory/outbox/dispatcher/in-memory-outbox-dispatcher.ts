import type { OutboxRepository, EventPublisher } from '@/app/_shared/ports';

export class InMemoryOutboxDispatcher {
  constructor(
    private readonly outbox: OutboxRepository,
    private readonly publisher: EventPublisher,
    private readonly batchSize = 100
  ) {}

  async runOnce(): Promise<number> {
    const pending = await this.outbox.listPending(this.batchSize);
    if (!pending.length) return 0;
    await this.publisher.publishAll(pending);
    await this.outbox.markDispatched(pending.map((e) => e.envelopeId));
    return pending.length;
  }
  
  async drain(maxIterations = 100): Promise<number> {
    let total = 0;
    for (let i = 0; i < maxIterations; i++) {
      const n = await this.runOnce();
      total += n;
      if (!n) break;
    }
    return total;
  }
}
