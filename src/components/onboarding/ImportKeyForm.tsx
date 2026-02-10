import { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { VpnKey } from '@mui/icons-material';
import { importFromPrivateKey } from '@/services/walletGenerator';
import { saveKeystore } from '@/services/keystore';
import { useStore } from '@/store';
import { WalletMode, WalletAccount } from '@/types/wallet';

interface ImportKeyFormProps {
  password: string;
  onSuccess: () => void;
}

export function ImportKeyForm({ password, onSuccess }: ImportKeyFormProps) {
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setMode = useStore((s) => s.setMode);
  const addAccount = useStore((s) => s.addAccount);
  const setActiveAccount = useStore((s) => s.setActiveAccount);
  const setInitialized = useStore((s) => s.setInitialized);
  const setSecretKey = useStore((s) => s.setSecretKey);
  const setLocked = useStore((s) => s.setLocked);

  const handleImport = async () => {
    if (!privateKey.trim()) {
      setError('Please enter a private key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { publicKey, secretKeyBase58 } = importFromPrivateKey(privateKey.trim());
      await saveKeystore(secretKeyBase58, password);

      const account: WalletAccount = {
        address: publicKey,
        label: 'Imported Wallet',
        mode: WalletMode.PrivateKey,
        createdAt: Date.now(),
      };

      setMode(WalletMode.PrivateKey);
      addAccount(account);
      setActiveAccount(account);
      setSecretKey(secretKeyBase58);
      setInitialized(true);
      setLocked(false);
      onSuccess();
    } catch {
      setError('Invalid private key. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <VpnKey color="primary" />
        <Typography variant="h6">Import Private Key</Typography>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="Enter your Base58 private key"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        type="password"
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Button
        fullWidth
        variant="contained"
        onClick={handleImport}
        disabled={loading || !privateKey.trim()}
        size="large"
      >
        {loading ? 'Importing...' : 'Import Wallet'}
      </Button>
    </Box>
  );
}
