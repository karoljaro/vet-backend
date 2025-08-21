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
import { resolveNow, TimeDeps } from '@/domain/shared/resolve-now';

export class Owner {
  private _events: DomainEvent[] = [];
  private constructor(
    public readonly id: OwnerId,
    private _props: OwnerProps
  ) {}

  static create(id: OwnerId, props: CreateOwnerProps, deps?: TimeDeps): Owner {
    OwnerBusinessValidator.validateName(props.name);
    OwnerBusinessValidator.validateEmail(props.email);
    OwnerBusinessValidator.validatePhone(props.phone);

    const now = resolveNow(deps);
    const domainProps: OwnerProps = Object.freeze({
      name: props.name.trim(),
      ...(props.email !== undefined ? { email: props.email } : {}),
      ...(props.phone !== undefined ? { phone: props.phone } : {}),
      ...(props.address !== undefined ? { address: props.address } : {}),
      status: 'active',
      createdAt: now,
      updatedAt: now,
      version: 1,
    } as OwnerProps);

    const owner = new Owner(id, domainProps);
    Owner.ensureTimestampsOrder(owner._props.createdAt, owner._props.updatedAt);
    return owner;
  }

  update(updates: UpdateOwnerProps, deps?: TimeDeps): void {
    OwnerBusinessValidator.validateName(updates.name ?? this._props.name);
    if (updates.email !== undefined) OwnerBusinessValidator.validateEmail(updates.email);
    if (updates.phone !== undefined) OwnerBusinessValidator.validatePhone(updates.phone);

    const newProps: OwnerProps = Object.freeze({
      ...this._props,
      ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
      ...(updates.email !== undefined ? { email: updates.email } : {}),
      ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
      ...(updates.address !== undefined ? { address: updates.address } : {}),
      updatedAt: resolveNow(deps),
      version: this._props.version + 1,
    });

    Owner.ensureTimestampsOrder(newProps.createdAt, newProps.updatedAt);
    this._props = newProps;
  }

  deactivate(deps?: TimeDeps): void {
    if (this._props.status === 'inactive') {
      throw new OwnerAlreadyInactiveError();
    }
    const now = resolveNow(deps);
    this.transitionStatus('inactive', { now: () => now });
    this._events.push({ type: 'OwnerDeactivated', occurredAt: now });
  }

  activate(deps?: TimeDeps): void {
    if (this._props.status === 'active') {
      throw new OwnerAlreadyActiveError();
    }
    const now = resolveNow(deps);
    this.transitionStatus('active', { now: () => now });
    this._events.push({ type: 'OwnerActivated', occurredAt: now });
  }

  private transitionStatus(status: OwnerStatus, deps?: TimeDeps): void {
    const newProps: OwnerProps = Object.freeze({
      ...this._props,
      status,
      updatedAt: resolveNow(deps),
      version: this._props.version + 1,
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
  get version() {
    return this._props.version;
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
