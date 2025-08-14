import type { PatientId } from '@/domain/patients/types';
import type { Patient } from '@/domain/patients';
import type { OwnerId } from '@/domain/owners/types/owner.types';
import type { Owner } from '@/domain/owners';
import type { EventEnvelope } from '@/app/_shared/events';

export interface TransactionContext {
  // will hold db transaction / context later
}

export interface UnitOfWork {
  withTransaction<T>(fn: (ctx: TransactionContext) => Promise<T>): Promise<T>;
  afterCommit?(fn: () => Promise<void> | void): void;
}

export interface Clock {
  now(): Date;
}
export interface IdGenerator {
  uuid(): string;
}

export interface PatientRepository {
  getById(id: PatientId, ctx?: TransactionContext): Promise<{ entity: Patient }>;
  save(entity: Patient, ctx?: TransactionContext): Promise<void>;
}

export interface EventPublisher {
  publishAll(envelopes: EventEnvelope[]): Promise<void>;
}

export interface OutboxRepository {
  append(envelopes: EventEnvelope[], ctx?: TransactionContext): Promise<void>;
  // future: fetchPending(batchSize), markDispatched(ids)
}

export interface OwnerRepository {
  getById(id: OwnerId, ctx?: TransactionContext): Promise<{ entity: Owner }>;
  save(entity: Owner, ctx?: TransactionContext): Promise<void>;
}

// TEMP: in-memory placeholder; move to infra + tests layer later
export class NoopUnitOfWork implements UnitOfWork {
  private _queue: Array<() => Promise<void> | void> = [];
  afterCommit(fn: () => Promise<void> | void) {
    this._queue.push(fn);
  }
  async withTransaction<T>(fn: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    this._queue = [];
    const result = await fn({} as TransactionContext);
    // simulate post-commit
    for (const f of this._queue) await f();
    return result;
  }
}
