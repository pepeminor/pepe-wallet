import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { SetPasswordForm } from '@/components/onboarding/SetPasswordForm';
import { GenerateWalletForm } from '@/components/onboarding/GenerateWalletForm';
import { ImportKeyForm } from '@/components/onboarding/ImportKeyForm';
import { ImportSeedForm } from '@/components/onboarding/ImportSeedForm';
import { ConnectWalletPanel } from '@/components/onboarding/ConnectWalletPanel';
import { useChainInit } from '@/hooks/useChain';

export function OnboardingPage() {
  useChainInit();

  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [password, setPassword] = useState<string | null>(null);

  const handleSuccess = () => {
    router.replace('/dashboard');
  };

  if (!password) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <SetPasswordForm onPasswordSet={setPassword} />
      </Paper>
    );
  }

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mb: 3, '& .MuiTab-root': { fontSize: '13px' } }}
      >
        <Tab label="Create" />
        <Tab label="Import Key" />
        <Tab label="Seed Phrase" />
        <Tab label="Connect" />
      </Tabs>

      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        {tab === 0 && (
          <GenerateWalletForm password={password} onSuccess={handleSuccess} />
        )}
        {tab === 1 && (
          <ImportKeyForm password={password} onSuccess={handleSuccess} />
        )}
        {tab === 2 && (
          <ImportSeedForm password={password} onSuccess={handleSuccess} />
        )}
        {tab === 3 && <ConnectWalletPanel onSuccess={handleSuccess} />}
      </Paper>
    </Box>
  );
}
