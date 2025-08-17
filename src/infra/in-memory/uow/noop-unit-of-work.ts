import type { TransactionContext, UnitOfWork } from '@/app/_shared/ports';

// In-memory / no-op UnitOfWork przeniesiony do infra.
// Używany w testach aplikacyjnych dopóki nie pojawi się prawdziwa implementacja transakcji.
export class NoopUnitOfWork implements UnitOfWork {
  async withTransaction<T>(fn: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    return fn({} as TransactionContext);
  }
}
