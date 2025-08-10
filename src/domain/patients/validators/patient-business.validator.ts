import {
  InvalidPatientDateOfBirthError,
  InvalidPatientNameError,
  InvalidPatientWeightError,
} from '@/domain/shared';

export class PatientBusinessValidator {
  static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new InvalidPatientNameError();
    }
    if (name.length > 100) {
      throw new InvalidPatientNameError();
    }
  }

  static validateWeight(weight: number): void {
    if (weight <= 0) {
      throw new InvalidPatientWeightError('non_positive');
    }
    if (weight > 500) {
      throw new InvalidPatientWeightError('too_heavy');
    }
  }

  static validateDateOfBirth(dateOfBirth: Date): void {
    const now = new Date();
    if (dateOfBirth > now) {
      throw new InvalidPatientDateOfBirthError('future');
    }

    // Compare at day resolution to avoid millisecond drift around the boundary
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dobDay = new Date(
      dateOfBirth.getFullYear(),
      dateOfBirth.getMonth(),
      dateOfBirth.getDate()
    );
    const maxAge = new Date(today);
    maxAge.setFullYear(maxAge.getFullYear() - 50);
    if (dobDay < maxAge) {
      throw new InvalidPatientDateOfBirthError('too_old');
    }
  }
}
