import type { PatientRepository, TransactionContext } from '@/app/_shared/ports';
import { ConcurrencyError } from '@/app/_shared/errors';
import { Patient } from '@/domain/patients';
import type { PatientId } from '@/domain/patients/types';

interface PatientRecord {
  entity: Patient;
  persistedVersion: number;
}

export class InMemoryPatientRepository implements PatientRepository {
  private store = new Map<string, PatientRecord>();

  seed(patients: Patient[]) {
    patients.forEach((p) => this.store.set(p.id, { entity: p, persistedVersion: p.version }));
  }

  async getById(id: PatientId, _ctx?: TransactionContext): Promise<{ entity: Patient }> {
    const rec = this.store.get(id);

    if (!rec) throw new Error(`Patient ${id} not found`);

    return { entity: rec.entity };
  }

  async save(entity: Patient, _ctx?: TransactionContext, expectedVersion?: number): Promise<void> {
    const rec = this.store.get(entity.id);

    if (!rec) {
      if (expectedVersion !== undefined && expectedVersion !== 1) {
        throw new ConcurrencyError(entity.id, expectedVersion, undefined);
      }
      this.store.set(entity.id, { entity, persistedVersion: entity.version });
      return;
    }

    if (entity.version !== rec.persistedVersion + 1) {
      throw new ConcurrencyError(entity.id, rec.persistedVersion + 1, rec.persistedVersion);
    }

    if (expectedVersion !== undefined && expectedVersion !== rec.persistedVersion) {
      throw new ConcurrencyError(entity.id, expectedVersion, rec.persistedVersion);
    }
    rec.persistedVersion = entity.version;
  }
}
