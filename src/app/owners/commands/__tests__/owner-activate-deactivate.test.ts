import { describe, it, expect, vi } from 'vitest';
import { activateOwner } from '@/app/owners/commands/activate-owner';
import { deactivateOwner } from '@/app/owners/commands/deactivate-owner';
import { Owner } from '@/domain/owners';
import { asOwnerId } from '@/domain/owners/types/owner.types';
import { EventEnvelope } from '@/app/_shared/events';

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
    const published: EventEnvelope[] = [];
    const publisher = { publishAll: vi.fn(async (envs: EventEnvelope[]) => { published.push(...envs) }) };

    await deactivateOwner(asOwnerId('o-1'), { repo, publisher } as any);
    await activateOwner(asOwnerId('o-1'), { repo, publisher } as any);

    expect(repo.getById).toHaveBeenCalledTimes(2);
    expect(repo.save).toHaveBeenCalledTimes(2);
    expect(published.map(p => p.type)).toEqual(['OwnerDeactivated', 'OwnerActivated']);
    expect(published.map(p => p.aggregateType)).toEqual(['Owner', 'Owner']);
    expect(published.map(p => p.aggregateId)).toEqual(['o-1', 'o-1']);
  });
});
