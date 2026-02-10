import { useState } from 'react';
import { Box, IconButton, Button, Alert, Paper } from '@mui/material';
import { SwapVert } from '@mui/icons-material';
import { useStore } from '@/store';
import { useSwapQuote } from '@/hooks/useSwapQuote';
import { useChainProvider } from '@/hooks/useChain';
import { SwapTokenInput } from './SwapTokenInput';
import { SwapRouteInfo } from './SwapRouteInfo';
import { TokenSelector } from '@/components/send/TokenSelector';
import { TokenBalance } from '@/types/token';
import bs58 from 'bs58';

export function SwapCard() {
  const inputToken = useStore((s) => s.inputToken);
  const outputToken = useStore((s) => s.outputToken);
  const inputAmount = useStore((s) => s.inputAmount);
  const outputAmount = useStore((s) => s.outputAmount);
  const quote = useStore((s) => s.quote);
  const swapLoading = useStore((s) => s.swapLoading);
  const swapError = useStore((s) => s.swapError);
  const setInputToken = useStore((s) => s.setInputToken);
  const setOutputToken = useStore((s) => s.setOutputToken);
  const setInputAmount = useStore((s) => s.setInputAmount);
  const flipTokens = useStore((s) => s.flipTokens);
  const activeAccount = useStore((s) => s.activeAccount);
  const secretKeyBase58 = useStore((s) => s.secretKeyBase58);
  const addToast = useStore((s) => s.addToast);
  const balances = useStore((s) => s.balances);

  const [selectorFor, setSelectorFor] = useState<'input' | 'output' | null>(null);
  const [executing, setExecuting] = useState(false);

  const provider = useChainProvider();

  useSwapQuote();

  const inputBalance = balances.find(
    (b) => b.token.mint === inputToken?.mint
  )?.uiBalance;

  const handleTokenSelect = (tb: TokenBalance) => {
    if (selectorFor === 'input') setInputToken(tb.token);
    else if (selectorFor === 'output') setOutputToken(tb.token);
  };

  const handleSwap = async () => {
    if (!quote || !activeAccount || !provider) return;

    setExecuting(true);
    try {
      const secretKey = secretKeyBase58
        ? bs58.decode(secretKeyBase58)
        : undefined;

      const sig = await provider.executeSwap({
        quote: {
          inputMint: quote.inputMint,
          outputMint: quote.outputMint,
          inAmount: quote.inAmount,
          outAmount: quote.outAmount,
          priceImpactPct: parseFloat(quote.priceImpactPct),
          routePlan: [],
          raw: quote,
        },
        userPublicKey: activeAccount.address,
        secretKey,
      });

      addToast({ type: 'success', message: `Swap confirmed! Sig: ${sig.slice(0, 16)}...` });
    } catch (err: unknown) {
      addToast({ type: 'error', message: err instanceof Error ? err.message : 'Swap failed' });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
      <SwapTokenInput
        label="You Pay"
        token={inputToken}
        amount={inputAmount}
        onAmountChange={setInputAmount}
        onTokenClick={() => setSelectorFor('input')}
        maxAmount={inputBalance}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center', my: -1.5, zIndex: 1 }}>
        <IconButton
          onClick={flipTokens}
          sx={{
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            '&:hover': { bgcolor: 'background.default' },
          }}
        >
          <SwapVert />
        </IconButton>
      </Box>

      <SwapTokenInput
        label="You Receive"
        token={outputToken}
        amount={outputAmount}
        onTokenClick={() => setSelectorFor('output')}
        disabled
      />

      {quote && outputToken && (
        <Paper sx={{ p: 1.5, mt: 1 }}>
          <SwapRouteInfo quote={quote} outputDecimals={outputToken.decimals} />
        </Paper>
      )}

      {swapError && <Alert severity="error">{swapError}</Alert>}

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleSwap}
        disabled={!quote || executing || swapLoading}
        sx={{ mt: 1 }}
      >
        {executing
          ? 'Swapping...'
          : swapLoading
          ? 'Getting quote...'
          : 'Swap'}
      </Button>

      <TokenSelector
        open={!!selectorFor}
        onClose={() => setSelectorFor(null)}
        onSelect={handleTokenSelect}
      />
    </Box>
  );
}
