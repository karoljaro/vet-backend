import { DomainError } from '@/domain/shared';

export type ApplicationError =
  | {
      kind: 'domain';
      code: string;
      message: string;
      httpStatus: number;
      original: DomainError;
    }
  | {
      kind: 'unexpected';
      code: 'INTERNAL_ERROR';
      message: string;
      httpStatus: number; // 500
      original: unknown;
    };

const domainHttpStatus: Record<string, number> = {
  PATIENT_ALREADY_DECEASED: 409,
  PATIENT_UPDATE_NOT_ALLOWED: 409,
  OWNER_ALREADY_INACTIVE: 409,
  OWNER_ALREADY_ACTIVE: 409,
  INVALID_PATIENT_NAME: 400,
  INVALID_PATIENT_WEIGHT: 400,
  INVALID_PATIENT_DOB: 400,
  MISSING_OWNER: 400,
  INVALID_TIMESTAMPS_ORDER: 400,
  INVALID_OWNER_NAME: 400,
  INVALID_OWNER_EMAIL: 400,
  INVALID_OWNER_PHONE: 400,
};

export function toApplicationError(err: unknown): ApplicationError {
  if (err instanceof DomainError) {
    return {
      kind: 'domain',
      code: err.code,
      message: err.message,
      httpStatus: domainHttpStatus[err.code] ?? 400,
      original: err,
    };
  }
  return {
    kind: 'unexpected',
    code: 'INTERNAL_ERROR',
    message: 'Unexpected error',
    httpStatus: 500,
    original: err,
  };
}

export function isDomainAppError(
  e: ApplicationError
): e is Extract<ApplicationError, { kind: 'domain' }> {
  return e.kind === 'domain';
}
