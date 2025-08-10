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
  });

  it('updates basic fields and preserves invariants', () => {
    const o = Owner.create(asOwnerId('owner-2'), { name: 'Jan' });
    o.update({ name: 'Jan Nowak', phone: '+48 123 456 789' });
    expect(o.name).toBe('Jan Nowak');
    expect(o.phone).toContain('123');
  });

  it('deactivates and prevents double deactivation/activation', () => {
    const o = Owner.create(asOwnerId('owner-3'), { name: 'Anna' });
    o.deactivate();
    expect(o.isActive()).toBe(false);
    expect(() => o.deactivate()).toThrowError(OwnerAlreadyInactiveError);
    o.activate();
    expect(o.isActive()).toBe(true);
    expect(() => o.activate()).toThrowError(OwnerAlreadyActiveError);
  });
});
