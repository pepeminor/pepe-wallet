import { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useStore } from '@/store';
import { WalletMode, WalletAccount } from '@/types/wallet';

interface ConnectWalletPanelProps {
  onSuccess: () => void;
}

export function ConnectWalletPanel({ onSuccess }: ConnectWalletPanelProps) {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const setMode = useStore((s) => s.setMode);
  const addAccount = useStore((s) => s.addAccount);
  const setActiveAccount = useStore((s) => s.setActiveAccount);
  const setInitialized = useStore((s) => s.setInitialized);
  const setLocked = useStore((s) => s.setLocked);

  useEffect(() => {
    if (connected && publicKey) {
      const account: WalletAccount = {
        address: publicKey.toBase58(),
        label: 'Extension Wallet',
        mode: WalletMode.Extension,
        createdAt: Date.now(),
      };

      setMode(WalletMode.Extension);
      addAccount(account);
      setActiveAccount(account);
      setInitialized(true);
      setLocked(false);
      onSuccess();
    }
  }, [connected, publicKey, addAccount, onSuccess, setActiveAccount, setInitialized, setLocked, setMode]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <AccountBalanceWallet color="primary" />
        <Typography variant="h6">Connect Wallet</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Connect your Phantom or Solflare wallet extension.
      </Typography>

      <Button
        fullWidth
        variant="contained"
        onClick={() => setVisible(true)}
        size="large"
      >
        Select Wallet
      </Button>
    </Box>
  );
}
