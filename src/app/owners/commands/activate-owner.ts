import type { OwnerId } from '@/domain/owners/types/owner.types';
import { mapDomainEventsToEnvelopes } from '@/app/_shared/mappers/events.mapper';
import type { OwnerRepository, UnitOfWork, OutboxRepository } from '@/app/_shared/ports';

export async function activateOwner(
  id: OwnerId,
  deps: { repo: OwnerRepository; outbox: OutboxRepository; uow: UnitOfWork }
) {
  const { repo, outbox, uow } = deps;

  await uow.withTransaction(async (tx) => {
    const { entity } = await repo.getById(id, tx);

    entity.activate();
    await repo.save(entity, tx);

    const envelopes = mapDomainEventsToEnvelopes(entity.pullDomainEvents(), id, 'Owner', {
      aggregateVersion: entity.version,
    });
    await outbox.append(envelopes, tx);
  });
}
