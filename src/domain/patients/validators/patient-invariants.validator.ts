import { PatientProps, CreatePatientProps } from '../types';
import { InvalidTimestampsOrderError, MissingOwnerError } from '@/domain/shared';
import { PatientBusinessValidator } from './patient-business.validator';

export class PatientInvariantsValidator {
  static validateCreateProps(props: CreatePatientProps): void {
    if (!props.ownerId || props.ownerId.trim().length === 0) {
      throw new MissingOwnerError();
    }

    PatientBusinessValidator.validateName(props.name);

    if (props.weight !== undefined) {
      PatientBusinessValidator.validateWeight(props.weight);
    }

    if (props.dateOfBirth) {
      PatientBusinessValidator.validateDateOfBirth(props.dateOfBirth);
    }
  }

  static validatePatientProps(props: PatientProps): void {
    this.validateCreateProps(props);

    if (props.updatedAt < props.createdAt) {
      throw new InvalidTimestampsOrderError();
    }
  }
}
