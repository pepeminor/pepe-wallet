import { Box, Typography, Chip } from '@mui/material';
import { JupiterQuoteResponse } from '@/types/swap';

interface SwapRouteInfoProps {
  quote: JupiterQuoteResponse;
  outputDecimals: number;
}

export function SwapRouteInfo({ quote, outputDecimals }: SwapRouteInfoProps) {
  const priceImpact = parseFloat(quote.priceImpactPct);
  const minReceived =
    parseFloat(quote.otherAmountThreshold) / 10 ** outputDecimals;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Price Impact
        </Typography>
        <Typography
          variant="caption"
          color={priceImpact > 1 ? 'error.main' : 'text.secondary'}
        >
          {priceImpact.toFixed(2)}%
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Minimum Received
        </Typography>
        <Typography variant="caption">
          {minReceived.toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Slippage
        </Typography>
        <Typography variant="caption">
          {(quote.slippageBps / 100).toFixed(1)}%
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {quote.routePlan.map((step, i) => (
          <Chip
            key={i}
            label={step.swapInfo.label}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '10px' }}
          />
        ))}
      </Box>
    </Box>
  );
}
