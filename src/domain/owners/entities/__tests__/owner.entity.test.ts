import { describe, it, expect } from 'vitest';
import { Owner } from '@/domain/owners/entities/owner.entity';
import { asOwnerId } from '@/domain/owners/types/owner.types';
import { OwnerAlreadyActiveError, OwnerAlreadyInactiveError } from '@/domain/shared';

describe('Owner Entity', () => {
  it('creates active owner with timestamps', () => {
    const o = Owner.create(asOwnerId('owner-1'), { name: 'Jan Kowalski' });
    expect(o.isActive()).toBe(true);
    expect(o.createdAt).toBeInstanceOf(Date);
    expect(o.updatedAt).toBeInstanceOf(Date);
    expect(o.name).toBe('Jan Kowalski');
    expect(o.version).toBe(1);
  });

  it('updates basic fields and preserves invariants', () => {
    const o = Owner.create(asOwnerId('owner-2'), { name: 'Jan' });
    o.update({ name: 'Jan Nowak', phone: '+48 123 456 789' });
    expect(o.name).toBe('Jan Nowak');
    expect(o.phone).toContain('123');
    expect(o.version).toBe(2);
  });

  it('deactivates and prevents double deactivation/activation', () => {
    const o = Owner.create(asOwnerId('owner-3'), { name: 'Anna' });
    o.deactivate();
    expect(o.isActive()).toBe(false);
    expect(o.version).toBe(2);
    expect(() => o.deactivate()).toThrowError(OwnerAlreadyInactiveError);
    o.activate();
    expect(o.isActive()).toBe(true);
    expect(o.version).toBe(3);
    expect(() => o.activate()).toThrowError(OwnerAlreadyActiveError);
  });

  it('records and drains domain events on status transitions', () => {
    const o = Owner.create(asOwnerId('owner-4'), { name: 'Ola' });
    // initial buffer empty
    expect(o.pullDomainEvents()).toHaveLength(0);

    o.deactivate();
    const events1 = o.pullDomainEvents();
    expect(events1).toHaveLength(1);
    const e1 = events1[0]!;
    expect(e1.type).toBe('OwnerDeactivated');
    expect(e1.occurredAt).toBeInstanceOf(Date);
    expect(o.version).toBe(2);

    o.activate();
    const events2 = o.pullDomainEvents();
    expect(events2).toHaveLength(1);
    const e2 = events2[0]!;
    expect(e2.type).toBe('OwnerActivated');
    expect(e2.occurredAt).toBeInstanceOf(Date);
    expect(o.version).toBe(3);

    // drained
    expect(o.pullDomainEvents()).toHaveLength(0);
  });

  it('returns a copy when draining events (defensive copy)', () => {
    const o = Owner.create(asOwnerId('owner-5'), { name: 'Kasia' });
    o.deactivate();
    const events = o.pullDomainEvents();
    expect(events).toHaveLength(1);
    // Mutate returned array
    (events as any).push({ type: 'Fake', occurredAt: new Date(0) });
    // Next drain should be empty (internal buffer was cleared) and not contain mutation
    const next = o.pullDomainEvents();
    expect(next).toHaveLength(0);
  });
});
