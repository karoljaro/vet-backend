import { mapDomainEventsToEnvelopes } from '@/app/_shared/mappers/events.mapper';
import { OutboxRepository, PatientRepository, UnitOfWork } from '@/app/_shared/ports';
import { asOwnerId } from '@/domain/owners';
import { asPatientId, Patient } from '@/domain/patients';
import type { CreatePatientProps, PatientId } from '@/domain/patients/types';

import { randomUUID } from 'crypto';

export async function createPatientCommand(
  id: PatientId,
  props: Omit<CreatePatientProps, 'ownerId'>, // temporary instead CreatePatientProps
  deps: {
    repo: PatientRepository;
    outbox: OutboxRepository;
    uow: UnitOfWork;
  }
) {
  const { repo, outbox, uow } = deps;

  await uow.withTransaction(async (tx) => {
    const { entity: patient } = await repo.create({
      ...props,
      ownerId: asOwnerId(randomUUID()),
    }, tx); //temporary ownerId is generated here. Will replace after implementation of Owner entities
    
    await repo.save(patient, tx);

    const event = patient.pullDomainEvents();

    const envelopes = mapDomainEventsToEnvelopes(event, id, 'Patient', {
      aggregateVersion: patient.version,
    });

    await outbox.append(envelopes, tx);
  });
}
