import type { PatientId } from '@/domain/patients/types';
import { mapDomainEventsToEnvelopes } from '@/app/_shared/mappers/events.mapper';
import type { DomainEvent } from '@/domain/shared';
import type { PatientRepository, UnitOfWork, OutboxRepository } from '@/app/_shared/ports';

export async function markPatientDeceased(
  id: PatientId,
  deps: { repo: PatientRepository; outbox: OutboxRepository; uow: UnitOfWork }
) {
  const { repo, outbox, uow } = deps;

  await uow.withTransaction(async (tx) => {
    const { entity: patient } = await repo.getById(id, tx);

    patient.markAsDeceased();
    const expectedVersion = patient.version; // optimistic concurrency baseline before mutation
    await repo.save(patient, tx, expectedVersion);

    const envelopes = mapDomainEventsToEnvelopes(patient.pullDomainEvents(), id, 'Patient', {
      aggregateVersion: patient.version,
    });
    await outbox.append(envelopes, tx);
  });
}
