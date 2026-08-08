const MIN_LENGTH = 8;

// Only for validating NEW passwords being set (register, admin-create, change, reset).
// Never run this against an existing hashed password from the database.
function validatePasswordStrength(password) {
  if (typeof password !== 'string' || !password) {
    return { valid: false, message: 'Password is required' };
  }

  const failures = [];
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

module.exports = validatePasswordStrength;
