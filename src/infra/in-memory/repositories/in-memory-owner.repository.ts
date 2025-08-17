import type { OwnerRepository, TransactionContext } from '@/app/_shared/ports';
import { ConcurrencyError } from '@/app/_shared/errors';
import { Owner } from '@/domain/owners';
import type { OwnerId } from '@/domain/owners/types/owner.types';

interface OwnerRecord {
  entity: Owner;
  persistedVersion: number;
}

export class InMemoryOwnerRepository implements OwnerRepository {
  private store = new Map<string, OwnerRecord>();

  seed(owners: Owner[]) {
    owners.forEach((o) => this.store.set(o.id, { entity: o, persistedVersion: o.version }));
  }

  async getById(id: OwnerId, _ctx?: TransactionContext): Promise<{ entity: Owner }> {
    const rec = this.store.get(id);

    if (!rec) throw new Error(`Owner ${id} not found`);

    return { entity: rec.entity };
  }

  async save(entity: Owner, _ctx?: TransactionContext, expectedVersion?: number): Promise<void> {
    const rec = this.store.get(entity.id);

    if (!rec) {
      if (expectedVersion !== undefined && expectedVersion !== 1) {
        throw new ConcurrencyError(entity.id, expectedVersion, undefined);
      }
      this.store.set(entity.id, { entity, persistedVersion: entity.version });
      return;
    }

    // rec persists previous committed version
    if (entity.version !== rec.persistedVersion + 1) {
      throw new ConcurrencyError(entity.id, rec.persistedVersion + 1, rec.persistedVersion);
    }

    if (expectedVersion !== undefined && expectedVersion !== rec.persistedVersion) {
      throw new ConcurrencyError(entity.id, expectedVersion, rec.persistedVersion);
    }

    rec.persistedVersion = entity.version;
  }
}
