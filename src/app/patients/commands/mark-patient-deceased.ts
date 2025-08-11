import type { PatientId } from '@/domain/patients/types';
import type { EventEnvelope } from '@/app/_shared/events';
import type { DomainEvent } from '@/domain/shared';
import type { PatientRepository, EventPublisher } from '@/app/_shared/ports';

export async function markPatientDeceased(
  id: PatientId,
  deps: { repo: PatientRepository; publisher: EventPublisher }
) {
  const { repo, publisher } = deps;
  const { entity: patient } = await repo.getById(id);

  patient.markAsDeceased();
  await repo.save(patient);

  const envelopes: EventEnvelope[] = patient.pullDomainEvents().map((e: DomainEvent) => ({
    type: e.type,
    occurredAt: e.occurredAt,
    aggregateId: id,
    aggregateType: 'Patient',
  }));

  await publisher.publishAll(envelopes);
}
