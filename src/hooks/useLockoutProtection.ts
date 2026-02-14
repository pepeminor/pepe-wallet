/**
 * Lockout Protection Hook - Prevents brute force attacks on wallet unlock
 *
 * Features:
 * - Max 5 failed attempts before lockout
 * - 5-minute lockout duration
 * - Exponential backoff for repeated lockouts
 * - Persists in localStorage across page refresh
 */

import { useState, useEffect } from 'react';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'wallet_lockout_data';

interface LockoutData {
  attempts: number;
  lockedUntil: number | null;
  lockoutCount: number; // How many times has user been locked out
}

export function useLockoutProtection() {
  const [lockoutData, setLockoutData] = useState<LockoutData>(() => {
    // Load from localStorage on init
    if (typeof window === 'undefined') {
      return { attempts: 0, lockedUntil: null, lockoutCount: 0 };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load lockout data:', e);
    }

    return { attempts: 0, lockedUntil: null, lockoutCount: 0 };
  });

  // Persist to localStorage whenever lockoutData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lockoutData));
      } catch (e) {
        console.error('Failed to save lockout data:', e);
      }
    }
  }, [lockoutData]);

  const isLocked = lockoutData.lockedUntil && Date.now() < lockoutData.lockedUntil;
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - lockoutData.attempts);

  /**
   * Record a failed unlock attempt
   * Locks wallet if max attempts exceeded
   */
  const recordFailedAttempt = () => {
    const newAttempts = lockoutData.attempts + 1;

    if (newAttempts >= MAX_ATTEMPTS) {
      // Apply exponential backoff: double lockout duration for each repeated lockout
      const lockoutMultiplier = Math.pow(2, lockoutData.lockoutCount);
      const lockoutDuration = LOCKOUT_DURATION * lockoutMultiplier;

      setLockoutData({
        attempts: 0,
        lockedUntil: Date.now() + lockoutDuration,
        lockoutCount: lockoutData.lockoutCount + 1,
      });
    } else {
      setLockoutData({
        ...lockoutData,
        attempts: newAttempts,
      });
    }
  };

  /**
   * Reset lockout data after successful unlock
   */
  const reset = () => {
    setLockoutData({
      attempts: 0,
      lockedUntil: null,
      // Keep lockoutCount to maintain exponential backoff if user gets locked again
      lockoutCount: 0,
    });
  };

  /**
   * Get remaining lockout time in milliseconds
   */
  const getRemainingTime = (): number => {
    if (!lockoutData.lockedUntil) return 0;
    return Math.max(0, lockoutData.lockedUntil - Date.now());
  };

  /**
   * Format remaining time as MM:SS
   */
  const getFormattedRemainingTime = (): string => {
    const remaining = getRemainingTime();
    if (remaining === 0) return '00:00';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isLocked: !!isLocked,
    remainingAttempts,
    recordFailedAttempt,
    reset,
    getRemainingTime,
    getFormattedRemainingTime,
    lockoutCount: lockoutData.lockoutCount,
  };
}
