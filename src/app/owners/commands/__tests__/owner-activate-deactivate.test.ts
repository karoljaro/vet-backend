import { describe, it, expect, vi } from 'vitest';
import { activateOwner } from '@/app/owners/commands/activate-owner';
import { deactivateOwner } from '@/app/owners/commands/deactivate-owner';
import { NoopUnitOfWork } from '@/app/_shared/ports';
import { InMemoryOutboxRepository } from '@/app/_shared/outbox/in-memory-outbox.repository';
import { Owner } from '@/domain/owners';
import { asOwnerId } from '@/domain/owners/types/owner.types';

function makeOwner() {
  return Owner.create(asOwnerId('o-1'), { name: 'Jan' });
}

describe('Owner activate/deactivate (app)', () => {
  it('saves and publishes envelopes for status changes', async () => {
    const owner = makeOwner();
    const repo = {
      getById: vi.fn(async () => ({ entity: owner })),
      save: vi.fn(async () => {}),
    };
    // publisher usunięty z handlerów – test już go nie przekazuje

    const uow = new NoopUnitOfWork();
    const outbox = new InMemoryOutboxRepository();
    await deactivateOwner(asOwnerId('o-1'), { repo, outbox, uow });
    await activateOwner(asOwnerId('o-1'), { repo, outbox, uow });

    const peek = outbox.peek();
    expect(peek.pending.length).toBe(2);
    expect(peek.dispatched.length).toBe(0);

    expect(repo.getById).toHaveBeenCalledTimes(2);
    expect(repo.save).toHaveBeenCalledTimes(2);
    // brak publishera – sprawdzamy tylko outbox
  });
});
