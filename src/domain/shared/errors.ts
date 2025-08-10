export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class PatientAlreadyDeceasedError extends DomainError {
  constructor() {
    super('PATIENT_ALREADY_DECEASED', 'Cannot update deceased patient');
  }
}

export class PatientUpdateNotAllowedError extends DomainError {
  constructor() {
    super('PATIENT_UPDATE_NOT_ALLOWED', 'Cannot update deceased patient');
  }
}

export class InvalidPatientNameError extends DomainError {
  constructor() {
    super('INVALID_PATIENT_NAME', 'Patient name cannot be empty or too long');
  }
}

export class InvalidPatientWeightError extends DomainError {
  constructor(reason: 'non_positive' | 'too_heavy') {
    const message =
      reason === 'non_positive' ? 'Weight must be positive' : 'Weight seems unrealistic (>500kg)';
    super('INVALID_PATIENT_WEIGHT', message);
  }
}

export class InvalidPatientDateOfBirthError extends DomainError {
  constructor(reason: 'future' | 'too_old') {
    const message =
      reason === 'future' ? 'Date of birth cannot be in the future' : 'Date of birth seems too old';
    super('INVALID_PATIENT_DOB', message);
  }
}

export class MissingOwnerError extends DomainError {
  constructor() {
    super('MISSING_OWNER', 'Patient must have an owner');
  }
}

export class InvalidTimestampsOrderError extends DomainError {
  constructor() {
    super('INVALID_TIMESTAMPS_ORDER', 'Updated date cannot be before created date');
  }
}

// Owner-related errors
export class InvalidOwnerNameError extends DomainError {
  constructor() {
    super('INVALID_OWNER_NAME', 'Owner name cannot be empty or too long');
  }
}

export class InvalidOwnerEmailError extends DomainError {
  constructor() {
    super('INVALID_OWNER_EMAIL', 'Owner email is invalid');
  }
}

export class InvalidOwnerPhoneError extends DomainError {
  constructor(reason: 'length' | 'format') {
    const message =
      reason === 'length' ? 'Owner phone must have 7-20 digits' : 'Owner phone has invalid format';
    super('INVALID_OWNER_PHONE', message);
  }
}

export class OwnerAlreadyInactiveError extends DomainError {
  constructor() {
    super('OWNER_ALREADY_INACTIVE', 'Owner is already inactive');
  }
}

export class OwnerAlreadyActiveError extends DomainError {
  constructor() {
    super('OWNER_ALREADY_ACTIVE', 'Owner is already active');
  }
}
