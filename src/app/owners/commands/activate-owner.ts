import type { OwnerId } from '@/domain/owners/types/owner.types';
import type { EventEnvelope } from '@/app/_shared/events';
import type { EventPublisher, OwnerRepository } from '@/app/_shared/ports';

export async function activateOwner(
  id: OwnerId,
  deps: { repo: OwnerRepository; publisher: EventPublisher }
) {
  const { repo, publisher } = deps;
  const { entity } = await repo.getById(id);

  entity.activate();
  await repo.save(entity);

  const envelopes: EventEnvelope[] = entity.pullDomainEvents().map((e) => ({
    type: e.type,
    occurredAt: e.occurredAt,
    aggregateId: id,
    aggregateType: 'Owner',
  }));

  await publisher.publishAll(envelopes);
}
