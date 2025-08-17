import { describe, it, expect } from 'vitest';
import { InMemoryOwnerRepository } from '../in-memory-owner.repository';
import { InMemoryPatientRepository } from '../in-memory-patient.repository';
import { Owner } from '@/domain/owners';
import { Patient } from '@/domain/patients';
import { asOwnerId } from '@/domain/owners/types/owner.types';
import { asPatientId } from '@/domain/patients/types/patient.types';
import { ConcurrencyError } from '@/app/_shared/errors';

function makeOwner() {
  return Owner.create(asOwnerId('o-1'), { name: 'Ala' });
}
function makePatient() {
  return Patient.create(asPatientId('p-1'), {
    name: 'Burek',
    species: 'dog',
    breed: 'Labrador',
    gender: 'male',
    ownerId: asOwnerId('o-1'),
  });
}

describe('In-memory repositories concurrency', () => {
  it('owner save succeeds when expectedVersion matches persisted version', async () => {
    const repo = new InMemoryOwnerRepository();
    const o = makeOwner(); // version 1
    await repo.save(o, undefined, 1); // insert
    const prior = o.version; // 1
    o.deactivate(); // version -> 2
    await repo.save(o, undefined, prior); // expectedVersion = 1
    expect(o.version).toBe(2);
  });

  it('owner save fails when expectedVersion mismatches persisted version', async () => {
    const repo = new InMemoryOwnerRepository();
    const o = makeOwner();
    await repo.save(o, undefined, 1);
    const prior = o.version; // 1
    o.deactivate(); // version 2
    await expect(repo.save(o, undefined, prior + 1)).rejects.toBeInstanceOf(ConcurrencyError);
  });

  it('patient save succeeds then fails on wrong expectedVersion', async () => {
    const repo = new InMemoryPatientRepository();
    const p = makePatient();
    await repo.save(p, undefined, 1);
    const prior = p.version; //1
    p.markAsDeceased(); // version 2
    await expect(repo.save(p, undefined, prior + 1)).rejects.toBeInstanceOf(ConcurrencyError); // wrong expectedVersion (should be prior)
  });
});
