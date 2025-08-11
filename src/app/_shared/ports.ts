import type { PatientId } from '@/domain/patients/types';
import type { Patient } from '@/domain/patients';
import type { OwnerId } from '@/domain/owners/types/owner.types';
import type { Owner } from '@/domain/owners';
import type { EventEnvelope } from '@/app/_shared/events';

export interface UnitOfWork {
  withTransaction<T>(fn: (ctx: unknown) => Promise<T>): Promise<T>;
}

export interface Clock {
  now(): Date;
}
export interface IdGenerator {
  uuid(): string;
}

export interface PatientRepository {
  getById(id: PatientId, ctx?: unknown): Promise<{ entity: Patient }>;
  save(entity: Patient, ctx?: unknown): Promise<void>;
}

export interface EventPublisher {
  publishAll(envelopes: EventEnvelope[]): Promise<void>;
}

export interface OwnerRepository {
  getById(id: OwnerId, ctx?: unknown): Promise<{ entity: Owner }>
  save(entity: Owner, ctx?: unknown): Promise<void>
}
