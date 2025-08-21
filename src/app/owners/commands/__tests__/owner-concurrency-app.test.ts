import { describe, it, expect } from 'vitest';
import { deactivateOwner } from '@/app/owners/commands/deactivate-owner';
import { InMemoryOwnerRepository } from '@/infra/in-memory/repositories/in-memory-owner.repository';
import { InMemoryOutboxRepository } from '@/infra/in-memory/outbox/in-memory-outbox.repository';
import { NoopUnitOfWork } from '@/infra/in-memory/uow/noop-unit-of-work';
import { Owner } from '@/domain/owners';
import { asOwnerId } from '@/domain/owners/types/owner.types';
import { ConcurrencyError } from '@/app/_shared/errors';

// Simulates a race: between read and save inside the command handler another commit occurs.
// We override repository.save to inject a concurrent state change before the original save.

describe('Owner deactivate (app) concurrency simulation', () => {
  it('fails with ConcurrencyError when aggregate changes between read and save', async () => {
    const id = asOwnerId('o-concurrency-1');
    const base = Owner.create(id, { name: 'Race Owner' }); // version 1
    const repo = new InMemoryOwnerRepository();
    await repo.save(base, undefined, 1); // insert (persistedVersion=1)

    const outbox = new InMemoryOutboxRepository();
    const uow = new NoopUnitOfWork();

    const originalSave = repo.save.bind(repo);
    let injected = false;
    repo.save = async (entity, ctx, expectedVersion) => {
      if (!injected) {
        injected = true;
        const { entity: current } = await repo.getById(id);
        // Perform a benign update that bumps version without conflicting domain invariant
        current.update({ name: current.name }); // version -> 2
        await originalSave(current, ctx, expectedVersion); // commit concurrent change (persistedVersion=2)
      }
      return originalSave(entity, ctx, expectedVersion); // handler entity now stale vs persisted state
    };

    await expect(deactivateOwner(id, { repo, outbox, uow })).rejects.toBeInstanceOf(ConcurrencyError);
  });
});
