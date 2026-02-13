'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useStore } from '@/store';
import { useSendTransaction } from '@/hooks/useSendTransaction';
import { ValidatedInput } from '@/components/common/ValidatedInput';
import { TokenSelector } from './TokenSelector';
import { QrScanner } from './QrScanner';
import { TokenIcon } from '@/components/common/TokenIcon';
import { TokenBalance } from '@/types/token';
import { isValidSolanaAddress, isValidEvmAddress } from '@/utils/validation';
import { getNativeMint, isEvmChain } from '@/config/constants';

interface SendFormProps {
  initialMint?: string;
}

interface SendFormValues {
  recipient: string;
  amount: string;
}

const createSendSchema = (maxBalance: number, isEvm: boolean) =>
  yup.object({
    recipient: yup
      .string()
      .required('Address is required')
      .test('valid-address', isEvm ? 'Invalid EVM address' : 'Invalid Solana address', (v) =>
        v ? (isEvm ? isValidEvmAddress(v) : isValidSolanaAddress(v)) : false
      ),
    amount: yup
      .string()
      .required('Amount is required')
      .test('positive', 'Must be greater than 0', (v) => {
        const n = parseFloat(v || '');
        return !isNaN(n) && n > 0;
      })
      .test('max-balance', `Exceeds balance (max ${maxBalance})`, (v) => {
        const n = parseFloat(v || '');
        return !isNaN(n) && n <= maxBalance;
      }),
  });

export function SendForm({ initialMint }: SendFormProps) {
  const balances = useStore((s) => s.balances);
  const activeChainId = useStore((s) => s.activeChainId);
  console.log({activeChainId});
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  console.log({selectedToken});
  const { send, sending, txSignature, error } = useSendTransaction();

  const maxBalance = selectedToken?.uiBalance ?? 0;
  const isEvm = isEvmChain(activeChainId);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<SendFormValues>({
    resolver: yupResolver(createSendSchema(maxBalance, isEvm)),
    defaultValues: { recipient: '', amount: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (balances.length > 0 && !selectedToken) {
      const nativeMint = getNativeMint(activeChainId);
      const token = initialMint
        ? balances.find((b) => b.token.mint === initialMint)
        : balances.find((b) => b.token.mint === nativeMint);
      setSelectedToken(token ?? balances[0]);
    }
  }, [balances, initialMint, selectedToken, activeChainId]);

  // Reset selected token on chain switch
  useEffect(() => {
    setSelectedToken(null);
  }, [activeChainId]);

  const onSubmit = (data: SendFormValues) => {
    if (!selectedToken) return;
    send({
      to: data.recipient,
      amount: parseFloat(data.amount),
      mint: selectedToken.token.mint,
      decimals: selectedToken.token.decimals,
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 2 }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Send Token
      </Typography>

      {/* Token selector */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Token
        </Typography>
        <Chip
          avatar={
            selectedToken ? (
              <TokenIcon
                icon={selectedToken.token.icon}
                symbol={selectedToken.token.symbol}
                size={24}
              />
            ) : undefined
          }
          label={selectedToken?.token.symbol ?? 'Select token'}
          onClick={() => setSelectorOpen(true)}
          sx={{ fontSize: '14px', height: 40, px: 1 }}
        />
      </Box>

      {/* Recipient */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Recipient
          </Typography>
          <QrScanner onScan={(address) => setValue('recipient', address, { shouldValidate: true })} />
        </Box>
        <ValidatedInput<SendFormValues>
          name="recipient"
          control={control}
          fullWidth
          placeholder={isEvm ? '0x address' : 'Solana address'}
        />
      </Box>

      {/* Amount */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Amount
          </Typography>
          {maxBalance > 0 && (
            <Typography variant="caption" color="text.secondary">
              Balance: {maxBalance.toLocaleString()}{' '}
              <Button
                size="small"
                onClick={() => setValue('amount', maxBalance.toString(), { shouldValidate: true })}
                sx={{ minWidth: 'auto', p: 0, fontSize: '11px', textTransform: 'uppercase' }}
              >
                MAX
              </Button>
            </Typography>
          )}
        </Box>
        <ValidatedInput<SendFormValues>
          name="amount"
          control={control}
          fullWidth
          placeholder="0.00"
          InputProps={{
            endAdornment: selectedToken ? (
              <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                {selectedToken.token.symbol}
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

      {error && <Alert severity="error">{error}</Alert>}

      {txSignature && (
        <Alert severity="success">
          Transaction confirmed!
          <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
            {txSignature}
          </Typography>
        </Alert>
      )}

      <Button
        fullWidth
        variant="contained"
        size="large"
        type="submit"
        disabled={!isValid || sending || !selectedToken}
      >
        {sending ? 'Sending...' : 'Send'}
      </Button>

      <TokenSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={setSelectedToken}
      />
    </Box>
  );
}
