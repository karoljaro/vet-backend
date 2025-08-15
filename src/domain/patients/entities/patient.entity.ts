import { OwnerId } from '@/domain/owners';
import {
  PatientProps,
  CreatePatientProps,
  UpdatePatientBasicInfoProps,
  Species,
  Gender,
  PatientStatus,
  PatientId,
} from '../types';
import { PatientInvariantsValidator } from '../validators';
import {
  PatientAlreadyDeceasedError,
  PatientUpdateNotAllowedError,
  DomainEvent,
} from '@/domain/shared';

export class Patient {
  private props: Readonly<PatientProps>;
  private _events: DomainEvent[] = [];

  private constructor(
    public readonly id: PatientId,
    props: PatientProps
  ) {
    PatientInvariantsValidator.validatePatientProps(props);
    this.props = Object.freeze({ ...props });
  }

  static create(id: PatientId, createProps: CreatePatientProps): Patient {
    PatientInvariantsValidator.validateCreateProps(createProps);

    const props: PatientProps = {
      name: createProps.name,
      species: createProps.species,
      breed: createProps.breed,
      gender: createProps.gender,
      ownerId: createProps.ownerId,
      ...(createProps.dateOfBirth ? { dateOfBirth: new Date(createProps.dateOfBirth) } : {}),
      ...(createProps.weight !== undefined ? { weight: createProps.weight } : {}),
      ...(createProps.photoUrl !== undefined ? { photoUrl: createProps.photoUrl } : {}),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    return new Patient(id, props);
  }

  // Getters
  get name(): string {
    return this.props.name;
  }
  get species(): Species {
    return this.props.species;
  }
  get breed(): string {
    return this.props.breed;
  }
  get gender(): Gender {
    return this.props.gender;
  }
  get ownerId(): OwnerId {
    return this.props.ownerId;
  }
  get dateOfBirth(): Date | undefined {
    return this.props.dateOfBirth ? new Date(this.props.dateOfBirth) : undefined;
  }
  get weight(): number | undefined {
    return this.props.weight;
  }
  get photoUrl(): string | undefined {
    return this.props.photoUrl;
  }
  get status(): PatientStatus {
    return this.props.status;
  }
  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }
  get updatedAt(): Date {
    return new Date(this.props.updatedAt);
  }
  get version(): number {
    return this.props.version;
  }

  // Business methods
  updateBasicInfo(updates: UpdatePatientBasicInfoProps): void {
    if (this.isDeceased()) {
      throw new PatientUpdateNotAllowedError();
    }

    const next: PatientProps = {
      ...this.props,
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.breed !== undefined ? { breed: updates.breed } : {}),
      ...(updates.weight !== undefined ? { weight: updates.weight } : {}),
      ...(updates.photoUrl !== undefined ? { photoUrl: updates.photoUrl } : {}),
      updatedAt: new Date(),
      version: this.props.version + 1,
    };

    PatientInvariantsValidator.validatePatientProps(next);
    this.props = Object.freeze({ ...next });
  }

  markAsDeceased(): void {
    if (this.isDeceased()) {
      throw new PatientAlreadyDeceasedError();
    }
    const next: PatientProps = {
      ...this.props,
      status: 'deceased',
      updatedAt: new Date(),
      version: this.props.version + 1,
    };
    PatientInvariantsValidator.validatePatientProps(next);
    this.props = Object.freeze({ ...next });
    this._events.push({
      type: 'PatientDeceased',
      occurredAt: new Date(),
    });
  }

  // Query methods
  isDeceased(): boolean {
    return this.props.status === 'deceased';
  }

  isActive(): boolean {
    return this.props.status === 'active';
  }

  calculateAge(): number | null {
    if (!this.props.dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(this.props.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // Domain events recorder
  pullDomainEvents(): DomainEvent[] {
    const out = this._events.slice();
    this._events.length = 0;
    return out;
  }
}
