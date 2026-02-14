'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import { Close, Lock, Block } from '@mui/icons-material';
import { useLockoutProtection } from '@/hooks/useLockoutProtection';
import { loadKeystore } from '@/services/keystore';

interface PasswordConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void | Promise<void>;
  title?: string;
  message?: string;
}

export function PasswordConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Transaction',
  message = 'Enter your password to authorize this transaction.',
}: PasswordConfirmationDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState('');

  const {
    isLocked,
    remainingAttempts,
    recordFailedAttempt,
    reset,
    getFormattedRemainingTime,
    lockoutCount,
  } = useLockoutProtection();

  // Update countdown every second when locked
  useEffect(() => {
    if (!isLocked) return;

    const interval = setInterval(() => {
      setCountdown(getFormattedRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, getFormattedRemainingTime]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setPassword('');
      setError('');
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!password.trim()) return;

    // Check if locked out
    if (isLocked) {
      setError(`Too many failed attempts. Locked until ${countdown}`);
      return;
    }

    setLoading(true);
    setError('');

    // Verify password first - only this step affects lockout attempts
    try {
      await loadKeystore(password);
    } catch {
      recordFailedAttempt();

      const attemptsLeft = Math.max(0, remainingAttempts - 1);
      if (attemptsLeft > 0) {
        setError(`Incorrect password. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`);
      } else {
        setError('Too many failed attempts. Wallet locked.');
      }

      setLoading(false);
      return;
    }

    // Password correct: clear lockout state immediately
    reset();

    try {
      // Execute protected action (send/swap). Errors here are NOT password failures.
      await onConfirm(password);

      // Success - reset form state
      setPassword('');
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing during verification
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          mx: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLocked ? <Block color="error" /> : <Lock color="warning" />}
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          </Box>
          {!loading && (
            <IconButton onClick={handleClose} size="small" edge="end">
              <Close />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {isLocked ? (
          <Box sx={{ py: 2 }}>
            <Alert severity="error" icon={<Block />} sx={{ mb: 2 }}>
              Too many failed password attempts. Please wait before trying again.
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
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>

            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLocked && !loading && handleConfirm()}
              autoFocus
              autoComplete="current-password"
              disabled={isLocked || loading}
              error={!!error}
            />

            {error && <Alert severity="error">{error}</Alert>}

            {!isLocked && remainingAttempts < 5 && remainingAttempts > 0 && (
              <Alert severity="warning">
                {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining before lockout.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      {!isLocked && (
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleConfirm}
            disabled={loading || !password.trim() || isLocked}
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            {loading ? 'Verifying...' : 'Confirm'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
