import type { OwnerId } from '@/domain/owners/types/owner.types';
import type { EventEnvelope } from '@/app/_shared/events';
import type { EventPublisher, OwnerRepository, UnitOfWork } from '@/app/_shared/ports';

export async function deactivateOwner(
  id: OwnerId,
  deps: { repo: OwnerRepository; publisher: EventPublisher; uow: UnitOfWork }
) {
  const { repo, publisher, uow } = deps;

  await uow.withTransaction(async (tx) => {
    const { entity } = await repo.getById(id, tx);

    entity.deactivate();
    await repo.save(entity, tx);

    const envelopes: EventEnvelope[] = entity.pullDomainEvents().map((e) => ({
      type: e.type,
      occurredAt: e.occurredAt,
      aggregateId: id,
      aggregateType: 'Owner',
    }));

    await publisher.publishAll(envelopes);
  });
}
