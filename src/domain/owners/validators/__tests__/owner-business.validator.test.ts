import { describe, it, expect } from 'vitest';
import { OwnerBusinessValidator } from '@/domain/owners/validators/owner-business.validator';
import { DomainError, InvalidOwnerEmailError, InvalidOwnerNameError, InvalidOwnerPhoneError } from '@/domain/shared';

describe('OwnerBusinessValidator', () => {
  it('validates name boundaries', () => {
    expect(() => OwnerBusinessValidator.validateName('')).toThrowError(InvalidOwnerNameError);
    expect(() => OwnerBusinessValidator.validateName('A'.repeat(101))).toThrowError(InvalidOwnerNameError);
    expect(() => OwnerBusinessValidator.validateName('Jan')).not.toThrow();
  });

  it('validates email format when provided', () => {
    expect(() => OwnerBusinessValidator.validateEmail('not-an-email')).toThrowError(InvalidOwnerEmailError);
    expect(() => OwnerBusinessValidator.validateEmail('john@example.com')).not.toThrow();
    expect(() => OwnerBusinessValidator.validateEmail(undefined)).not.toThrow();
  });

  it('validates phone format/length when provided', () => {
    expect(() => OwnerBusinessValidator.validatePhone('abc')).toThrowError(InvalidOwnerPhoneError);
    expect(() => OwnerBusinessValidator.validatePhone('12345')).toThrowError(InvalidOwnerPhoneError);
    expect(() => OwnerBusinessValidator.validatePhone('+48 123 456 789')).not.toThrow();

    try {
      OwnerBusinessValidator.validatePhone('123');
    } catch (e) {
      const err = e as DomainError;
      expect(err.code).toBe('INVALID_OWNER_PHONE');
    }
  });
});
