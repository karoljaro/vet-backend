import { describe, it, expect, vi } from 'vitest';
import { markPatientDeceased } from '../mark-patient-deceased.command';
import { NoopUnitOfWork } from '@/infra/in-memory/uow/noop-unit-of-work';
import { InMemoryOutboxRepository } from '@/infra/in-memory/outbox/in-memory-outbox.repository';
import { Patient } from '@/domain/patients';
import { asPatientId } from '@/domain/patients/types/patient.types';
import { asOwnerId } from '@/domain/owners/types/owner.types';

function makePatient() {
  return Patient.create(asPatientId('p-1'), {
    name: 'Burek',
    species: 'dog',
    breed: 'Labrador',
    gender: 'male',
    ownerId: asOwnerId('o-1'),
  });
}

describe('markPatientDeceased (app)', () => {
  it('saves aggregate and publishes envelope with aggregateId', async () => {
    const patient = makePatient();
    const repo = {
      getById: vi.fn(async () => ({ entity: patient })),
      save: vi.fn(async (_entity: any, _tx: any, _expected?: number) => {}),
    };

    const uow = new NoopUnitOfWork();
    const outbox = new InMemoryOutboxRepository();
    await markPatientDeceased(asPatientId('p-1'), { repo, outbox, uow });

    // ensure event first stored to outbox (in this impl publish runs after commit so both true)
    expect(outbox.peek().pending.length).toBe(1);
    expect(outbox.peek().dispatched.length).toBe(0);

    expect(repo.getById).toHaveBeenCalledOnce();
    expect(repo.save).toHaveBeenCalledOnce();
    const callArgs = repo.save.mock.calls[0]!;
    expect(callArgs[2]).toBe(1); // initial version before mutation
  });
});
