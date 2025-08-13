import type { PatientId } from '@/domain/patients/types';
import { mapDomainEventsToEnvelopes } from '@/app/_shared/mappers/events.mapper';
import type { DomainEvent } from '@/domain/shared';
import type { PatientRepository, EventPublisher, UnitOfWork } from '@/app/_shared/ports';

export async function markPatientDeceased(
  id: PatientId,
  deps: { repo: PatientRepository; publisher: EventPublisher; uow: UnitOfWork }
) {
  const { repo, publisher, uow } = deps;

  await uow.withTransaction(async (tx) => {
    const { entity: patient } = await repo.getById(id, tx);

    patient.markAsDeceased();
    await repo.save(patient, tx);

  const envelopes = mapDomainEventsToEnvelopes(patient.pullDomainEvents(), id, 'Patient');
  await publisher.publishAll(envelopes);
  });
}
