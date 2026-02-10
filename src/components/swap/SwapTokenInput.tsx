import { Box, Typography, Chip } from '@mui/material';
import { TokenIcon } from '@/components/common/TokenIcon';
import { AmountInput } from '@/components/common/AmountInput';
import { TokenInfo } from '@/types/token';

interface SwapTokenInputProps {
  label: string;
  token: TokenInfo | null;
  amount: string;
  onAmountChange?: (value: string) => void;
  onTokenClick: () => void;
  maxAmount?: number;
  disabled?: boolean;
}

export function SwapTokenInput({
  label,
  token,
  amount,
  onAmountChange,
  onTokenClick,
  maxAmount,
  disabled,
}: SwapTokenInputProps) {
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        p: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Chip
          avatar={
            token ? (
              <TokenIcon icon={token.icon} symbol={token.symbol} size={20} />
            ) : undefined
          }
          label={token?.symbol ?? 'Select'}
          onClick={onTokenClick}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
      </Box>
      <AmountInput
        value={amount}
        onChange={onAmountChange ?? (() => {})}
        maxAmount={maxAmount}
        disabled={disabled || !onAmountChange}
        tokenSymbol=""
      />
    </Box>
  );
}
