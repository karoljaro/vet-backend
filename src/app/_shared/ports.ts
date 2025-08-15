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

// EventPublisher pozostaje portem ale nie jest aktualnie używany w command handlerach
export interface EventPublisher {
  publishAll(envelopes: EventEnvelope[]): Promise<void>;
}

export interface OutboxRepository {
  append(envelopes: EventEnvelope[], ctx?: TransactionContext): Promise<void>;
  listPending(limit?: number, ctx?: TransactionContext): Promise<EventEnvelope[]>;
  markDispatched(ids: string[], ctx?: TransactionContext): Promise<void>;
}

export interface OwnerRepository {
  getById(id: OwnerId, ctx?: TransactionContext): Promise<{ entity: Owner }>;
  save(entity: Owner, ctx?: TransactionContext): Promise<void>;
}

// TEMP: in-memory placeholder; move to infra + tests layer later
export class NoopUnitOfWork implements UnitOfWork {
  async withTransaction<T>(fn: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    return fn({} as TransactionContext);
  }
}
