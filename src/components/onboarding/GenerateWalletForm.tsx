import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { AddCircle, ContentCopy, Check } from '@mui/icons-material';
import { generateWallet } from '@/services/walletGenerator';
import { saveKeystore } from '@/services/keystore';
import { useStore } from '@/store';
import { WalletMode, WalletAccount } from '@/types/wallet';
import { copyToClipboard } from '@/utils/clipboard';

interface GenerateWalletFormProps {
  password: string;
  onSuccess: () => void;
}

export function GenerateWalletForm({ password, onSuccess }: GenerateWalletFormProps) {
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const setMode = useStore((s) => s.setMode);
  const addAccount = useStore((s) => s.addAccount);
  const setActiveAccount = useStore((s) => s.setActiveAccount);
  const setInitialized = useStore((s) => s.setInitialized);
  const setSecretKey = useStore((s) => s.setSecretKey);
  const setLocked = useStore((s) => s.setLocked);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const wallet = generateWallet();
      setMnemonic(wallet.mnemonic);
      await saveKeystore(wallet.secretKeyBase58, password);

      const account: WalletAccount = {
        address: wallet.publicKey,
        label: 'New Wallet',
        mode: WalletMode.Generated,
        createdAt: Date.now(),
      };

      setMode(WalletMode.Generated);
      addAccount(account);
      setActiveAccount(account);
      setSecretKey(wallet.secretKeyBase58);
    } catch (err) {
      console.error('Failed to generate wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setInitialized(true);
    setLocked(false);
    onSuccess();
  };

  if (!mnemonic) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AddCircle color="primary" />
          <Typography variant="h6">Create New Wallet</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Generate a new Solana wallet with a recovery phrase.
        </Typography>

        <Button
          fullWidth
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          size="large"
        >
          {loading ? 'Generating...' : 'Generate Wallet'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="warning">
        Save your recovery phrase! You will not be able to see it again.
      </Alert>

      <Paper sx={{ p: 2, position: 'relative' }}>
        <Typography
          variant="body1"
          sx={{ fontFamily: 'monospace', wordBreak: 'break-word', lineHeight: 1.8 }}
        >
          {mnemonic}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy'}>
          <IconButton
            onClick={handleCopy}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Paper>

      <Button
        fullWidth
        variant={confirmed ? 'contained' : 'outlined'}
        onClick={() => (confirmed ? handleConfirm() : setConfirmed(true))}
        size="large"
      >
        {confirmed ? 'Continue to Wallet' : 'I have saved my recovery phrase'}
      </Button>
    </Box>
  );
}
