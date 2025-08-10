import {
  InvalidOwnerNameError,
  InvalidOwnerEmailError,
  InvalidOwnerPhoneError,
} from '@/domain/shared';

export class OwnerBusinessValidator {
  static validateName(name: string): void {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) {
      throw new InvalidOwnerNameError();
    }
  }

  static validateEmail(email?: string): void {
    if (!email) return;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      throw new InvalidOwnerEmailError();
    }
  }

  static validatePhone(phone?: string): void {
    if (!phone) return;
    // allow digits, spaces, plus, dashes, parentheses; require at least 7 digits
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 20) {
      throw new InvalidOwnerPhoneError('length');
    }
    const allowed = /^[0-9+\-()\s]+$/;
    if (!allowed.test(phone)) {
      throw new InvalidOwnerPhoneError('format');
    }
  }
}
