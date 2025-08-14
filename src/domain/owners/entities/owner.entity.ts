import { OwnerBusinessValidator } from '@/domain/owners/validators/owner-business.validator';
import {
  OwnerProps,
  CreateOwnerProps,
  UpdateOwnerProps,
  OwnerStatus,
  OwnerId,
} from '@/domain/owners/types/owner.types';
import {
  InvalidTimestampsOrderError,
  OwnerAlreadyActiveError,
  OwnerAlreadyInactiveError,
  DomainEvent,
} from '@/domain/shared';

export class Owner {
  private _events: DomainEvent[] = [];
  private constructor(
    public readonly id: OwnerId,
    private _props: OwnerProps
  ) {}

  static create(id: OwnerId, props: CreateOwnerProps): Owner {
    OwnerBusinessValidator.validateName(props.name);
    OwnerBusinessValidator.validateEmail(props.email);
    OwnerBusinessValidator.validatePhone(props.phone);

    const now = new Date();
    const domainProps: OwnerProps = Object.freeze({
      name: props.name.trim(),
      ...(props.email !== undefined ? { email: props.email } : {}),
      ...(props.phone !== undefined ? { phone: props.phone } : {}),
      ...(props.address !== undefined ? { address: props.address } : {}),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    } as OwnerProps);

    const owner = new Owner(id, domainProps);
    Owner.ensureTimestampsOrder(owner._props.createdAt, owner._props.updatedAt);
    return owner;
  }

  update(updates: UpdateOwnerProps): void {
    OwnerBusinessValidator.validateName(updates.name ?? this._props.name);
    if (updates.email !== undefined) OwnerBusinessValidator.validateEmail(updates.email);
    if (updates.phone !== undefined) OwnerBusinessValidator.validatePhone(updates.phone);

    const newProps: OwnerProps = Object.freeze({
      ...this._props,
      ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
      ...(updates.email !== undefined ? { email: updates.email } : {}),
      ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
      ...(updates.address !== undefined ? { address: updates.address } : {}),
      updatedAt: new Date(),
    });

    Owner.ensureTimestampsOrder(newProps.createdAt, newProps.updatedAt);
    this._props = newProps;
  }

  deactivate(): void {
    if (this._props.status === 'inactive') {
      throw new OwnerAlreadyInactiveError();
    }
    this.transitionStatus('inactive');
    this._events.push({ type: 'OwnerDeactivated', occurredAt: new Date() });
  }

  activate(): void {
    if (this._props.status === 'active') {
      throw new OwnerAlreadyActiveError();
    }
    this.transitionStatus('active');
    this._events.push({ type: 'OwnerActivated', occurredAt: new Date() });
  }

  private transitionStatus(status: OwnerStatus): void {
    const newProps: OwnerProps = Object.freeze({
      ...this._props,
      status,
      updatedAt: new Date(),
    });
    Owner.ensureTimestampsOrder(newProps.createdAt, newProps.updatedAt);
    this._props = newProps;
  }

  private static ensureTimestampsOrder(createdAt: Date, updatedAt: Date): void {
    if (updatedAt.getTime() < createdAt.getTime()) {
      throw new InvalidTimestampsOrderError();
    }
  }

  // Getters
  get name() {
    return this._props.name;
  }
  get email() {
    return this._props.email;
  }
  get phone() {
    return this._props.phone;
  }
  get address() {
    return this._props.address;
  }
  get status() {
    return this._props.status;
  }
  get createdAt() {
    return new Date(this._props.createdAt);
  }
  get updatedAt() {
    return new Date(this._props.updatedAt);
  }
  isActive() {
    return this._props.status === 'active';
  }

  // Domain events recorder
  pullDomainEvents(): DomainEvent[] {
    const out = this._events.slice();
    this._events.length = 0;
    return out;
  }
}
