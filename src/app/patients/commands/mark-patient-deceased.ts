import type { PatientId } from '@/domain/patients/types';
import type { EventEnvelope } from '@/app/_shared/events';
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

    const envelopes: EventEnvelope[] = patient.pullDomainEvents().map((e: DomainEvent) => ({
      type: e.type,
      occurredAt: e.occurredAt,
      aggregateId: id,
      aggregateType: 'Patient',
    }));

    await publisher.publishAll(envelopes);
  });
}
