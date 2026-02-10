import { TextField, Box, Typography, Button } from '@mui/material';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  maxAmount?: number;
  disabled?: boolean;
  tokenSymbol?: string;
}

export function AmountInput({
  value,
  onChange,
  label = 'Amount',
  maxAmount,
  disabled,
  tokenSymbol,
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        {maxAmount !== undefined && (
          <Typography variant="caption" color="text.secondary">
            Balance: {maxAmount.toLocaleString()}{' '}
            <Button
              size="small"
              onClick={() => onChange(maxAmount.toString())}
              sx={{ minWidth: 'auto', p: 0, fontSize: '11px', textTransform: 'uppercase' }}
            >
              MAX
            </Button>
          </Typography>
        )}
      </Box>
      <TextField
        fullWidth
        value={value}
        onChange={handleChange}
        placeholder="0.00"
        disabled={disabled}
        InputProps={{
          endAdornment: tokenSymbol ? (
            <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
              {tokenSymbol}
            </Typography>
          ) : undefined,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: '20px',
            fontWeight: 600,
          },
        }}
      />
    </Box>
  );
}
