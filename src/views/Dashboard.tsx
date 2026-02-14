import { Box, Typography, Divider } from '@mui/material';
import { BalanceHeader } from '@/components/wallet/BalanceHeader';
import { ActionButtons } from '@/components/wallet/ActionButtons';
import { TokenList } from '@/components/wallet/TokenList';
import { TransactionList } from '@/components/wallet/TransactionList';
import { SecurityWarningBanner } from '@/components/common/SecurityWarningBanner';
import { useBalances } from '@/hooks/useBalances';
import { useChainInit } from '@/hooks/useChain';

export function DashboardPage() {
  useChainInit();
  useBalances();

  return (
    <Box sx={{ pb: 2 }}>
      {/* ✅ SECURITY FIX: Warn users about browser extensions */}
      <Box sx={{ px: 2, pt: 2 }}>
        <SecurityWarningBanner />
      </Box>

      <BalanceHeader />
      <ActionButtons />

      <Box sx={{ px: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Tokens
        </Typography>
        <TokenList />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Recent Activity
        </Typography>
        <TransactionList />
      </Box>
    </Box>
  );
}
