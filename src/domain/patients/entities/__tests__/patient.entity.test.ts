import { describe, it, expect } from 'vitest';
import { Patient } from '@/domain/patients';
import { asPatientId } from '@/domain/patients/types/patient.types';
import { asOwnerId } from '@/domain/owners/types/owner.types';
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
  ownerId: asOwnerId('owner-1'),
};

describe('Patient Entity', () => {
  it('creates active patient with timestamps', () => {
    const p = Patient.create(asPatientId('id-1'), baseProps);
    expect(p.isActive()).toBe(true);
    expect(p.createdAt).toBeInstanceOf(Date);
    expect(p.updatedAt).toBeInstanceOf(Date);
    expect(p.name).toBe('Burek');
  });

  it('updates basic info', () => {
    const p = Patient.create(asPatientId('id-2'), baseProps);
    p.updateBasicInfo({ name: 'Reksio', weight: 12 });
    expect(p.name).toBe('Reksio');
    expect(p.weight).toBe(12);
  });

  it('marks as deceased and prevents updates', () => {
    const p = Patient.create(asPatientId('id-3'), baseProps);
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
    const p = Patient.create(asPatientId('id-5'), baseProps);
    p.markAsDeceased();
    expect(() => p.markAsDeceased()).toThrowError(PatientAlreadyDeceasedError);
  });

  it('calculates age when dateOfBirth is set', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 5);
    const p = Patient.create(asPatientId('id-4'), { ...baseProps, dateOfBirth: dob });
    expect(p.calculateAge()).toBeGreaterThanOrEqual(4);
  });

  it('records and drains domain events on markAsDeceased', () => {
    const p = Patient.create(asPatientId('id-6'), baseProps);
    // before any change, buffer should be empty
    expect(p.pullDomainEvents()).toHaveLength(0);

    p.markAsDeceased();
    const events1 = p.pullDomainEvents();
    expect(events1).toHaveLength(1);
    const evt = events1[0]!;
    expect(evt.type).toBe('PatientDeceased');
    expect(evt.occurredAt).toBeInstanceOf(Date);

    // buffer is drained
    const events2 = p.pullDomainEvents();
    expect(events2).toHaveLength(0);
  });
});
