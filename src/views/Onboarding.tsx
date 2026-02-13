import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { SetPasswordForm } from '@/components/onboarding/SetPasswordForm';
import { ImportKeyForm } from '@/components/onboarding/ImportKeyForm';
import { ImportSeedForm } from '@/components/onboarding/ImportSeedForm';
import { ConnectWalletPanel } from '@/components/onboarding/ConnectWalletPanel';
import { useChainInit } from '@/hooks/useChain';
import { generateWallet } from '@/services/walletGenerator';
import { saveKeystore } from '@/services/keystore';
import { useStore } from '@/store';
import { WalletMode, WalletAccount } from '@/types/wallet';

export function OnboardingPage() {
  useChainInit();

  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'import'>('create');
  const [importPassword, setImportPassword] = useState<string | null>(null);
  const [importTab, setImportTab] = useState(0);
  const [creating, setCreating] = useState(false);

  const setWalletMode = useStore((s) => s.setMode);
  const addAccount = useStore((s) => s.addAccount);
  const setActiveAccount = useStore((s) => s.setActiveAccount);
  const setInitialized = useStore((s) => s.setInitialized);
  const setSecretKey = useStore((s) => s.setSecretKey);
  const setEvmPrivateKey = useStore((s) => s.setEvmPrivateKey);
  const setLocked = useStore((s) => s.setLocked);

  const handleCreatePassword = async (password: string) => {
    setCreating(true);
    try {
      const wallet = generateWallet();
      await saveKeystore(wallet.mnemonic, password);

      const account: WalletAccount = {
        address: wallet.publicKey,
        evmAddress: wallet.evmAddress,
        label: 'New Wallet',
        mode: WalletMode.Generated,
        createdAt: Date.now(),
      };

      setWalletMode(WalletMode.Generated);
      addAccount(account);
      setActiveAccount(account);
      setSecretKey(wallet.secretKeyBase58);
      setEvmPrivateKey(wallet.evmPrivateKey);
      setInitialized(true);
      setLocked(false);
      router.replace('/dashboard');
    } catch (err) {
      console.error('Failed to create wallet:', err);
      setCreating(false);
    }
  };

  const handleImportSuccess = () => {
    router.replace('/dashboard');
  };

  if (creating) {
    return (
      <Paper sx={{ p: 4, bgcolor: 'background.paper', textAlign: 'center' }}>
        <CircularProgress size={32} sx={{ mb: 2 }} />
        <Typography variant="body1">Creating your wallet...</Typography>
      </Paper>
    );
  }

  // Create wallet flow: just set password → auto-generate
  if (mode === 'create') {
    return (
      <Box>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <SetPasswordForm onPasswordSet={handleCreatePassword} />
        </Paper>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setMode('import')}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Already have a wallet? Import
          </Button>
        </Box>
      </Box>
    );
  }

  // Import flow: password first, then import tabs
  if (!importPassword) {
    return (
      <Box>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <SetPasswordForm onPasswordSet={setImportPassword} />
        </Paper>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setMode('create')}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Back to Create Wallet
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Tabs
        value={importTab}
        onChange={(_, v) => setImportTab(v)}
        variant="fullWidth"
        sx={{ mb: 3, '& .MuiTab-root': { fontSize: '13px' } }}
      >
        <Tab label="Seed Phrase" />
        <Tab label="Private Key" />
        <Tab label="Connect" />
      </Tabs>

      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        {importTab === 0 && (
          <ImportSeedForm password={importPassword} onSuccess={handleImportSuccess} />
        )}
        {importTab === 1 && (
          <ImportKeyForm password={importPassword} onSuccess={handleImportSuccess} />
        )}
        {importTab === 2 && <ConnectWalletPanel onSuccess={handleImportSuccess} />}
      </Paper>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button
          variant="text"
          size="small"
          onClick={() => { setMode('create'); setImportPassword(null); }}
          sx={{ textTransform: 'none', color: 'text.secondary' }}
        >
          Back to Create Wallet
        </Button>
      </Box>
    </Box>
  );
}
