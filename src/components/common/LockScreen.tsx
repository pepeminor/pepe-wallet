'use client';

import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper, LinearProgress } from '@mui/material';
import { Lock, Block } from '@mui/icons-material';
import {
  loadKeystore,
  isMnemonic,
  hasKeystore,
  hasEvmKeystore,
  loadEvmKeystore,
} from '@/services/keystore';
import { restoreFromMnemonic, importFromPrivateKey } from '@/services/walletGenerator';
import { secureKeyManager } from '@/services/secureKeyManager';
import { useLockoutProtection } from '@/hooks/useLockoutProtection';
import { useStore } from '@/store';

export function LockScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState('');

  const setLocked = useStore((s) => s.setLocked);

  // ✅ SECURITY FIX: Rate limiting protection
  const {
    isLocked,
    remainingAttempts,
    recordFailedAttempt,
    reset,
    getFormattedRemainingTime,
    lockoutCount
  } = useLockoutProtection();

  // Update countdown every second when locked
  useEffect(() => {
    if (!isLocked) return;

    const interval = setInterval(() => {
      setCountdown(getFormattedRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, getFormattedRemainingTime]);

  const handleUnlock = async () => {
    if (!password.trim()) return;

    // ✅ SECURITY FIX: Check if locked out
    if (isLocked) {
      setError(`Too many failed attempts. Locked until ${countdown}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Load main keystore (mnemonic or Solana key)
      if (hasKeystore()) {
        const decrypted = await loadKeystore(password);

        if (isMnemonic(decrypted)) {
          // Restore from mnemonic
          const wallet = restoreFromMnemonic(decrypted);

          // Unlock secure key manager with keys
          secureKeyManager.unlockSolana(wallet.secretKeyBase58);
          if (wallet.evmPrivateKey) {
            secureKeyManager.unlockEvm(wallet.evmPrivateKey);
          }
        } else {
          // Import from private key
          const { secretKeyBase58 } = importFromPrivateKey(decrypted);
          secureKeyManager.unlockSolana(secretKeyBase58);
        }
      }

      // Load separate EVM keystore if it exists
      if (hasEvmKeystore()) {
        try {
          const evmKey = await loadEvmKeystore(password);
          secureKeyManager.unlockEvm(evmKey);
        } catch {
          // EVM keystore might have different password or be corrupted
          // Main unlock still succeeds
        }
      }

      // Set up auto-lock callback
      secureKeyManager.setLockCallback(() => {
        setLocked(true);
      });

      // ✅ SECURITY FIX: Reset lockout on successful unlock
      reset();

      setLocked(false);
      setPassword(''); // Clear password field
      // useBalances hook will automatically fetch when isLocked changes to false
    } catch {
      // ✅ SECURITY FIX: Record failed attempt
      recordFailedAttempt();

      const attemptsLeft = Math.max(0, remainingAttempts - 1);
      if (attemptsLeft > 0) {
        setError(`Incorrect password. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`);
      } else {
        setError('Too many failed attempts. Wallet locked.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Paper sx={{ p: 3, maxWidth: 400, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {isLocked ? <Block color="error" /> : <Lock color="primary" />}
            <Typography variant="h6">
              {isLocked ? 'Wallet Locked' : 'Unlock Wallet'}
            </Typography>
          </Box>

          {isLocked ? (
            <>
              <Alert severity="error" icon={<Block />}>
                Too many failed unlock attempts. Please wait before trying again.
              </Alert>

              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {countdown}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Time remaining
                </Typography>
              </Box>

              {lockoutCount > 1 && (
                <Alert severity="warning">
                  Multiple lockouts detected. Lockout duration increases with each lockout.
                </Alert>
              )}
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                Enter your password to unlock your wallet.
              </Typography>

              <TextField
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLocked && handleUnlock()}
                autoFocus
                autoComplete="current-password"
                disabled={isLocked}
              />

              {error && <Alert severity="error">{error}</Alert>}

              {!isLocked && remainingAttempts < 5 && remainingAttempts > 0 && (
                <Alert severity="warning">
                  {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining before lockout.
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={handleUnlock}
                disabled={loading || !password.trim() || isLocked}
                size="large"
              >
                {loading ? 'Unlocking...' : 'Unlock'}
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
