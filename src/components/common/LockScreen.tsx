'use client';

import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { Lock } from '@mui/icons-material';
import {
  loadKeystore,
  isMnemonic,
  hasKeystore,
  hasEvmKeystore,
  loadEvmKeystore,
} from '@/services/keystore';
import { restoreFromMnemonic, importFromPrivateKey } from '@/services/walletGenerator';
import { useStore } from '@/store';

export function LockScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setSecretKey = useStore((s) => s.setSecretKey);
  const setEvmPrivateKey = useStore((s) => s.setEvmPrivateKey);
  const setLocked = useStore((s) => s.setLocked);

  const handleUnlock = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError('');

    try {
      // Load main keystore (mnemonic or Solana key)
      if (hasKeystore()) {
        const decrypted = await loadKeystore(password);

        if (isMnemonic(decrypted)) {
          const wallet = restoreFromMnemonic(decrypted);
          setSecretKey(wallet.secretKeyBase58);
          setEvmPrivateKey(wallet.evmPrivateKey);
        } else {
          const { secretKeyBase58 } = importFromPrivateKey(decrypted);
          setSecretKey(secretKeyBase58);
        }
      }

      // Load separate EVM keystore if it exists
      if (hasEvmKeystore()) {
        try {
          const evmKey = await loadEvmKeystore(password);
          setEvmPrivateKey(evmKey);
        } catch {
          // EVM keystore might have different password or be corrupted
          // Main unlock still succeeds
        }
      }

      setLocked(false);
      // useBalances hook will automatically fetch when isLocked changes to false
    } catch {
      setError('Incorrect password. Please try again.');
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
            <Lock color="primary" />
            <Typography variant="h6">Unlock Wallet</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Enter your password to unlock your wallet.
          </Typography>

          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            autoFocus
            autoComplete="current-password"
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            fullWidth
            variant="contained"
            onClick={handleUnlock}
            disabled={loading || !password.trim()}
            size="large"
          >
            {loading ? 'Unlocking...' : 'Unlock'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
