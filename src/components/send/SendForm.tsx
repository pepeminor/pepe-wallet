import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import { useStore } from '@/store';
import { useSendTransaction } from '@/hooks/useSendTransaction';
import { AmountInput } from '@/components/common/AmountInput';
import { TokenSelector } from './TokenSelector';
import { QrScanner } from './QrScanner';
import { TokenIcon } from '@/components/common/TokenIcon';
import { TokenBalance } from '@/types/token';
import { isValidSolanaAddress } from '@/utils/validation';
import { NATIVE_SOL_MINT } from '@/config/constants';

interface SendFormProps {
  initialMint?: string;
}

export function SendForm({ initialMint }: SendFormProps) {
  const balances = useStore((s) => s.balances);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectorOpen, setSelectorOpen] = useState(false);

  const { send, sending, txSignature, error } = useSendTransaction();

  useEffect(() => {
    if (balances.length > 0 && !selectedToken) {
      const token = initialMint
        ? balances.find((b) => b.token.mint === initialMint)
        : balances.find((b) => b.token.mint === NATIVE_SOL_MINT);
      setSelectedToken(token ?? balances[0]);
    }
  }, [balances, initialMint, selectedToken]);

  const handleSend = () => {
    if (!selectedToken || !recipient || !amount) return;

    send({
      to: recipient,
      amount: parseFloat(amount),
      mint: selectedToken.token.mint,
      decimals: selectedToken.token.decimals,
    });
  };

  const isValid =
    recipient &&
    isValidSolanaAddress(recipient) &&
    amount &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= (selectedToken?.uiBalance ?? 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 2 }}>
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
          <QrScanner onScan={setRecipient} />
        </Box>
        <TextField
          fullWidth
          placeholder="Solana address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          error={!!recipient && !isValidSolanaAddress(recipient)}
          helperText={
            recipient && !isValidSolanaAddress(recipient)
              ? 'Invalid address'
              : ''
          }
        />
      </Box>

      {/* Amount */}
      <AmountInput
        value={amount}
        onChange={setAmount}
        maxAmount={selectedToken?.uiBalance}
        tokenSymbol={selectedToken?.token.symbol}
      />

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
        onClick={handleSend}
        disabled={!isValid || sending}
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
