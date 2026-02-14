import { Box, IconButton, Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useStore } from '@/store';
import { usePrices } from '@/hooks/usePrices';
import { formatUsd, calcUsdValue } from '@/utils/format';

export function BalanceHeader() {
  const balances = useStore((s) => s.balances);
  const { prices, refresh, refreshing, cooldown } = usePrices();

  const totalUsd = balances.reduce((sum, b) => {
    const price = prices[b.token.mint]?.priceUsd ?? 0;
    return sum + calcUsdValue(b.uiBalance, price);
  }, 0);

  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Total Balance
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            background: '#3CB043',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {formatUsd(totalUsd)}
        </Typography>
        <IconButton
          onClick={refresh}
          disabled={cooldown || refreshing}
          size="small"
          sx={{
            color: 'text.secondary',
            transition: 'all 0.3s',
            '& svg': {
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
            },
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        >
          <Refresh fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
