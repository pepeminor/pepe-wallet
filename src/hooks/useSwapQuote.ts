import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { useChainProvider } from './useChain';
import { JupiterQuoteResponse } from '@/types/swap';

export function useSwapQuote() {
  const inputToken = useStore((s) => s.inputToken);
  const outputToken = useStore((s) => s.outputToken);
  const inputAmount = useStore((s) => s.inputAmount);
  const slippageBps = useStore((s) => s.slippageBps);
  const setOutputAmount = useStore((s) => s.setOutputAmount);
  const setQuote = useStore((s) => s.setQuote);
  const setSwapLoading = useStore((s) => s.setSwapLoading);
  const setSwapError = useStore((s) => s.setSwapError);

  const provider = useChainProvider();

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!inputToken || !outputToken || !inputAmount || !provider) {
      setOutputAmount('');
      setQuote(null);
      return;
    }

    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) {
      setOutputAmount('');
      setQuote(null);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSwapLoading(true);
      setSwapError(null);

      try {
        const lamports = Math.round(amount * 10 ** inputToken.decimals);
        const quote = await provider!.getSwapQuote({
          inputMint: inputToken.mint,
          outputMint: outputToken.mint,
          amount: lamports,
          slippageBps,
        });

        const outUi =
          parseFloat(quote.outAmount) / 10 ** outputToken.decimals;
        setOutputAmount(outUi.toString());
        setQuote(quote.raw as JupiterQuoteResponse);
      } catch (err: unknown) {
        setSwapError(err instanceof Error ? err.message : 'Failed to get quote');
        setOutputAmount('');
        setQuote(null);
      } finally {
        setSwapLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [inputToken, outputToken, inputAmount, slippageBps, provider, setOutputAmount, setQuote, setSwapError, setSwapLoading]);
}
