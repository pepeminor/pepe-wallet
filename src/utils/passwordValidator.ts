/**
 * Password Validator - Enforces strong password policy
 *
 * Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Not in common passwords list
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

const MIN_LENGTH = 12;
const REQUIRE_UPPERCASE = true;
const REQUIRE_LOWERCASE = true;
const REQUIRE_NUMBER = true;
const REQUIRE_SPECIAL = true;

// Top 100 most common passwords (subset for performance)
const COMMON_PASSWORDS = new Set([
  '123456',
  'password',
  '123456789',
  '12345678',
  '12345',
  '1234567',
  'password1',
  '123123',
  '1234567890',
  '000000',
  'abc123',
  'password123',
  'qwerty',
  'qwerty123',
  '1q2w3e4r',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'master',
  'sunshine',
  'princess',
  'football',
  'iloveyou',
  'shadow',
  'michael',
  'jennifer',
  'computer',
  'superman',
  'whatever',
  'passw0rd',
  'wallet',
  'wallet123',
  'mypassword',
  'trustno1',
  'batman',
  'secret',
  'password!',
  'pass123',
  'pass1234',
  'admin123',
  'root',
  'toor',
  'crypto',
  'crypto123',
  'blockchain',
  'bitcoin',
  'ethereum',
  'solana',
]);

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strengthScore = 0;

  // Check minimum length
  if (password.length < MIN_LENGTH) {
    errors.push(`Must be at least ${MIN_LENGTH} characters`);
  } else {
    strengthScore += 1;
    if (password.length >= 16) strengthScore += 1;
  }

  // Check for uppercase
  if (REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter (A-Z)');
  } else if (/[A-Z]/.test(password)) {
    strengthScore += 1;
  }

  // Check for lowercase
  if (REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter (a-z)');
  } else if (/[a-z]/.test(password)) {
    strengthScore += 1;
  }

  // Check for number
  if (REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push('Must contain at least one number (0-9)');
  } else if (/\d/.test(password)) {
    strengthScore += 1;
  }

  // Check for special character
  if (REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~;]/.test(password)) {
    errors.push('Must contain at least one special character (!@#$%^&*...)');
  } else if (/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~;]/.test(password)) {
    strengthScore += 1;
  }

  // Check against common passwords
  const lowerPassword = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lowerPassword)) {
    errors.push('This password is too common. Please choose a stronger password.');
  }

  // Check for simple patterns
  if (/^(.)\1+$/.test(password)) {
    // All same character (e.g., "aaaaaaaaaaaaa")
    errors.push('Password cannot be all the same character');
  }

  if (/^(012|123|234|345|456|567|678|789|890)+/.test(password)) {
    // Sequential numbers
    errors.push('Avoid sequential patterns like "123456"');
  }

  if (/^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+/i.test(password)) {
    // Sequential letters
    errors.push('Avoid sequential patterns like "abcdef"');
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (strengthScore <= 2) {
    strength = 'weak';
  } else if (strengthScore <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Get password strength label and color
 */
export function getPasswordStrengthInfo(strength: 'weak' | 'medium' | 'strong'): {
  label: string;
  color: string;
} {
  switch (strength) {
    case 'weak':
      return { label: 'Weak', color: '#f44336' }; // red
    case 'medium':
      return { label: 'Medium', color: '#ff9800' }; // orange
    case 'strong':
      return { label: 'Strong', color: '#4caf50' }; // green
  }
}
