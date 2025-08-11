import { describe, it, expect } from 'vitest';
import { PatientInvariantsValidator } from '@/domain/patients';
import { CreatePatientProps, PatientProps } from '@/domain/patients';
import { asOwnerId } from '@/domain/owners/types/owner.types';
import { DomainError, InvalidTimestampsOrderError, MissingOwnerError } from '@/domain/shared';

describe('PatientInvariantsValidator', () => {
  it('passes on valid create props', () => {
    const props: CreatePatientProps = {
      name: 'Burek',
      species: 'dog',
      breed: 'Labrador',
      gender: 'male',
      ownerId: asOwnerId('owner-1'),
      weight: 10,
    };
    expect(() => PatientInvariantsValidator.validateCreateProps(props)).not.toThrow();
  });

  it('fails when ownerId is empty', () => {
    const props: CreatePatientProps = {
      name: 'Burek',
      species: 'dog',
      breed: 'Labrador',
      gender: 'male',
      ownerId: asOwnerId(''),
    };
    expect(() => PatientInvariantsValidator.validateCreateProps(props)).toThrowError(
      MissingOwnerError
    );
    try {
      PatientInvariantsValidator.validateCreateProps(props);
    } catch (e) {
      const err = e as DomainError;
      expect(err.code).toBe('MISSING_OWNER');
    }
  });

  it('fails when updatedAt < createdAt', () => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 1000);
    const later = new Date(now.getTime() + 1000);

    const props: PatientProps = {
      name: 'Burek',
      species: 'dog',
      breed: 'Labrador',
      gender: 'male',
      ownerId: asOwnerId('owner-1'),
      status: 'active',
      createdAt: later,
      updatedAt: earlier,
    } as const;

    expect(() => PatientInvariantsValidator.validatePatientProps(props)).toThrowError(
      InvalidTimestampsOrderError
    );
    try {
      PatientInvariantsValidator.validatePatientProps(props);
    } catch (e) {
      const err = e as DomainError;
      expect(err.code).toBe('INVALID_TIMESTAMPS_ORDER');
    }
  });
});
