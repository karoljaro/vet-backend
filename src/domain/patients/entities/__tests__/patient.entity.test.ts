import { describe, it, expect } from 'vitest';
import { Patient } from '@/domain/patients';
import {
  DomainError,
  PatientAlreadyDeceasedError,
  PatientUpdateNotAllowedError,
} from '@/domain/shared';

const baseProps = {
  name: 'Burek',
  species: 'dog' as const,
  breed: 'Labrador',
  gender: 'male' as const,
  ownerId: 'owner-1',
};

describe('Patient Entity', () => {
  it('creates active patient with timestamps', () => {
    const p = Patient.create('id-1', baseProps);
    expect(p.isActive()).toBe(true);
    expect(p.createdAt).toBeInstanceOf(Date);
    expect(p.updatedAt).toBeInstanceOf(Date);
    expect(p.name).toBe('Burek');
  });

  it('updates basic info', () => {
    const p = Patient.create('id-2', baseProps);
    p.updateBasicInfo({ name: 'Reksio', weight: 12 });
    expect(p.name).toBe('Reksio');
    expect(p.weight).toBe(12);
  });

  it('marks as deceased and prevents updates', () => {
    const p = Patient.create('id-3', baseProps);
    p.markAsDeceased();
    expect(p.isDeceased()).toBe(true);
    expect(() => p.updateBasicInfo({ name: 'X' })).toThrowError(PatientUpdateNotAllowedError);
    try {
      p.updateBasicInfo({ name: 'X' });
    } catch (e) {
      const err = e as DomainError;
      expect(err.code).toBe('PATIENT_UPDATE_NOT_ALLOWED');
    }
  });

  it('cannot mark as deceased twice', () => {
    const p = Patient.create('id-5', baseProps);
    p.markAsDeceased();
    expect(() => p.markAsDeceased()).toThrowError(PatientAlreadyDeceasedError);
  });

  it('calculates age when dateOfBirth is set', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 5);
    const p = Patient.create('id-4', { ...baseProps, dateOfBirth: dob });
    expect(p.calculateAge()).toBeGreaterThanOrEqual(4);
  });
});
