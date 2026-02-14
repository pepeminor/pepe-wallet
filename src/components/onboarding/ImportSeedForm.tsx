import { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { Key } from '@mui/icons-material';
import { restoreFromMnemonic } from '@/services/walletGenerator';
import { saveKeystore } from '@/services/keystore';
import { secureKeyManager } from '@/services/secureKeyManager';
import { useStore } from '@/store';
import { WalletMode, WalletAccount } from '@/types/wallet';

interface ImportSeedFormProps {
  password: string;
  onSuccess: () => void;
}

export function ImportSeedForm({ password, onSuccess }: ImportSeedFormProps) {
  const [mnemonic, setMnemonic] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setMode = useStore((s) => s.setMode);
  const addAccount = useStore((s) => s.addAccount);
  const setActiveAccount = useStore((s) => s.setActiveAccount);
  const setInitialized = useStore((s) => s.setInitialized);
  const setLocked = useStore((s) => s.setLocked);

  const handleImport = async () => {
    const trimmed = mnemonic.trim().toLowerCase().split(/\s+/).join(' ');
    if (!trimmed) {
      setError('Please enter your seed phrase');
      return;
    }

    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount !== 12 && wordCount !== 24) {
      setError('Seed phrase must be 12 or 24 words');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const wallet = restoreFromMnemonic(trimmed);
      // Store mnemonic so both keys can be re-derived on unlock
      await saveKeystore(trimmed, password);

      const account: WalletAccount = {
        address: wallet.publicKey,
        evmAddress: wallet.evmAddress,
        label: 'Restored Wallet',
        mode: WalletMode.Generated,
        createdAt: Date.now(),
      };

      setMode(WalletMode.Generated);
      addAccount(account);
      setActiveAccount(account);

      // ✅ SECURITY FIX: Use secure key manager
      secureKeyManager.unlockSolana(wallet.secretKeyBase58);
      secureKeyManager.unlockEvm(wallet.evmPrivateKey);
      secureKeyManager.setLockCallback(() => {
        setLocked(true);
      });

      setInitialized(true);
      setLocked(false);
      onSuccess();
    } catch {
      setError('Invalid seed phrase. Please check your words and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Key color="primary" />
        <Typography variant="h6">Import Seed Phrase</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Enter your 12 or 24 word recovery phrase, separated by spaces.
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="word1 word2 word3 ... (12 or 24 words)"
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Button
        fullWidth
        variant="contained"
        onClick={handleImport}
        disabled={loading || !mnemonic.trim()}
        size="large"
      >
        {loading ? 'Restoring...' : 'Restore Wallet'}
      </Button>
    </Box>
  );
}
