import { Box, Typography } from '@mui/material';
import { useStore } from '@/store';
import { usePrices } from '@/hooks/usePrices';
import { formatUsd } from '@/utils/format';

export function BalanceHeader() {
  const balances = useStore((s) => s.balances);
  const prices = usePrices();

  const totalUsd = balances.reduce((sum, b) => {
    const price = prices[b.token.mint]?.priceUsd ?? 0;
    return sum + b.uiBalance * price;
  }, 0);

  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Total Balance
      </Typography>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          background: 'linear-gradient(135deg, #7b61ff, #00d4aa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {formatUsd(totalUsd)}
      </Typography>
    </Box>
  );
}
