import { describe, it, expect } from 'vitest';
import { InvalidPatientNameError, OwnerAlreadyActiveError } from '@/domain/shared';
import { toApplicationError, isDomainAppError } from '@/app/_shared/errors';

describe('toApplicationError', () => {
  it('maps domain error with proper status', () => {
    const domain = new InvalidPatientNameError();
    const appErr = toApplicationError(domain);
    expect(appErr.kind).toBe('domain');
    expect(appErr.code).toBe('INVALID_PATIENT_NAME');
    expect(appErr.httpStatus).toBe(400);
    expect(isDomainAppError(appErr)).toBe(true);
  });

  it('maps conflict domain error to 409', () => {
    const domain = new OwnerAlreadyActiveError();
    const appErr = toApplicationError(domain);
    expect(appErr.httpStatus).toBe(409);
  });

  it('maps unknown error to unexpected', () => {
    const appErr = toApplicationError(new Error('boom'));
    expect(appErr.kind).toBe('unexpected');
    expect(appErr.httpStatus).toBe(500);
  });
});
