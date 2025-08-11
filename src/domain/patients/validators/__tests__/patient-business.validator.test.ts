import { describe, it, expect } from 'vitest';
import { PatientBusinessValidator } from '@/domain/patients';
import {
  DomainError,
  InvalidPatientDateOfBirthError,
  InvalidPatientNameError,
  InvalidPatientWeightError,
} from '@/domain/shared';

describe('PatientBusinessValidator', () => {
  it('validates name', () => {
    expect(() => PatientBusinessValidator.validateName('')).toThrowError(InvalidPatientNameError);
    expect(() => PatientBusinessValidator.validateName('A'.repeat(101))).toThrowError(
      InvalidPatientNameError
    );
    expect(() => PatientBusinessValidator.validateName('Burek')).not.toThrow();
  });

  it('name length boundary (100 ok, 101 fails)', () => {
    const name100 = 'A'.repeat(100);
    const name101 = 'A'.repeat(101);
    expect(() => PatientBusinessValidator.validateName(name100)).not.toThrow();
    expect(() => PatientBusinessValidator.validateName(name101)).toThrowError(
      InvalidPatientNameError
    );
  });

  it('validates weight', () => {
    expect(() => PatientBusinessValidator.validateWeight(-1)).toThrowError(
      InvalidPatientWeightError
    );
    expect(() => PatientBusinessValidator.validateWeight(501)).toThrowError(
      InvalidPatientWeightError
    );
    expect(() => PatientBusinessValidator.validateWeight(10)).not.toThrow();

    try {
      PatientBusinessValidator.validateWeight(-1);
    } catch (e) {
      const err = e as DomainError;
      expect(err.code).toBe('INVALID_PATIENT_WEIGHT');
    }
  });

  it('weight boundary values', () => {
    // 0 should fail
    expect(() => PatientBusinessValidator.validateWeight(0)).toThrowError(
      InvalidPatientWeightError
    );
    // 500 is allowed (rule is > 500)
    expect(() => PatientBusinessValidator.validateWeight(500)).not.toThrow();
  });

  it('validates dateOfBirth', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60);
    expect(() => PatientBusinessValidator.validateDateOfBirth(future)).toThrowError(
      InvalidPatientDateOfBirthError
    );

    const old = new Date();
    old.setFullYear(old.getFullYear() - 49);
    expect(() => PatientBusinessValidator.validateDateOfBirth(old)).not.toThrow();

    const tooOld = new Date();
    tooOld.setFullYear(tooOld.getFullYear() - 51);
    expect(() => PatientBusinessValidator.validateDateOfBirth(tooOld)).toThrowError(
      InvalidPatientDateOfBirthError
    );

    try {
      PatientBusinessValidator.validateDateOfBirth(future);
    } catch (e) {
      const err = e as DomainError;
      expect(err.code).toBe('INVALID_PATIENT_DOB');
    }
  });

  it('dateOfBirth boundary (exactly 50 years ago passes, older fails)', () => {
    const now = new Date();
    const exactly50 = new Date(now);
    exactly50.setFullYear(exactly50.getFullYear() - 50);
    expect(() => PatientBusinessValidator.validateDateOfBirth(exactly50)).not.toThrow();

    const olderThan50 = new Date(now);
    olderThan50.setFullYear(olderThan50.getFullYear() - 50);
    olderThan50.setDate(olderThan50.getDate() - 1);
    expect(() => PatientBusinessValidator.validateDateOfBirth(olderThan50)).toThrowError(
      InvalidPatientDateOfBirthError
    );
  });
});
