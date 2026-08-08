const MIN_LENGTH = 8;

export const PASSWORD_REQUIREMENTS_HINT =
  'At least 8 characters, with uppercase, lowercase, a number, and a symbol (e.g. !@#$%^&*).';

export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}

// Mirrors Backend_PMS/src/utils/validatePassword.js — keep the two in sync.
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const failures: string[] = [];
  if (password.length < MIN_LENGTH) failures.push(`at least ${MIN_LENGTH} characters`);
  if (!/[A-Z]/.test(password)) failures.push('one uppercase letter');
  if (!/[a-z]/.test(password)) failures.push('one lowercase letter');
  if (!/[0-9]/.test(password)) failures.push('one number');
  if (!/[^A-Za-z0-9]/.test(password)) failures.push('one special character (e.g. !@#$%^&*)');

  if (failures.length > 0) {
    return { valid: false, message: `Password must contain ${failures.join(', ')}.` };
  }

  return { valid: true };
}
