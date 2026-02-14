import { StateCreator } from 'zustand';
import { TokenInfo } from '@/types/token';
import { JupiterQuoteResponse } from '@/types/swap';
import {
  DEFAULT_SLIPPAGE_BPS,
  MIN_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
  HIGH_SLIPPAGE_WARNING_BPS
} from '@/config/constants';

export interface SwapSlice {
  inputToken: TokenInfo | null;
  outputToken: TokenInfo | null;
  inputAmount: string;
  outputAmount: string;
  slippageBps: number;
  quote: JupiterQuoteResponse | null;
  swapLoading: boolean;
  swapError: string | null;

  setInputToken: (token: TokenInfo | null) => void;
  setOutputToken: (token: TokenInfo | null) => void;
  setInputAmount: (amount: string) => void;
  setOutputAmount: (amount: string) => void;
  setSlippage: (bps: number) => void;
  setQuote: (quote: JupiterQuoteResponse | null) => void;
  setSwapLoading: (loading: boolean) => void;
  setSwapError: (error: string | null) => void;
  flipTokens: () => void;
  resetSwap: () => void;
}

export const createSwapSlice: StateCreator<SwapSlice, [], [], SwapSlice> = (
  set
) => ({
  inputToken: null,
  outputToken: null,
  inputAmount: '',
  outputAmount: '',
  slippageBps: DEFAULT_SLIPPAGE_BPS,
  quote: null,
  swapLoading: false,
  swapError: null,

  setInputToken: (inputToken) => set({ inputToken }),
  setOutputToken: (outputToken) => set({ outputToken }),
  setInputAmount: (inputAmount) => set({ inputAmount }),
  setOutputAmount: (outputAmount) => set({ outputAmount }),
  setSlippage: (slippageBps) => {
    // ✅ SECURITY FIX: Validate slippage bounds
    if (slippageBps < MIN_SLIPPAGE_BPS || slippageBps > MAX_SLIPPAGE_BPS) {
      console.warn(
        `Slippage must be between ${MIN_SLIPPAGE_BPS/100}% and ${MAX_SLIPPAGE_BPS/100}%. ` +
        `Received: ${slippageBps/100}%. Using default ${DEFAULT_SLIPPAGE_BPS/100}%.`
      );
      set({ slippageBps: DEFAULT_SLIPPAGE_BPS });
      return;
    }

    // Warn on high slippage
    if (slippageBps > HIGH_SLIPPAGE_WARNING_BPS) {
      console.warn(
        `High slippage set: ${slippageBps/100}%. Risk of value loss from sandwich attacks.`
      );
    }

    set({ slippageBps });
  },
  setQuote: (quote) => set({ quote }),
  setSwapLoading: (swapLoading) => set({ swapLoading }),
  setSwapError: (swapError) => set({ swapError }),
  flipTokens: () =>
    set((state) => ({
      inputToken: state.outputToken,
      outputToken: state.inputToken,
      inputAmount: state.outputAmount,
      outputAmount: state.inputAmount,
      quote: null,
    })),
  resetSwap: () =>
    set({
      inputAmount: '',
      outputAmount: '',
      quote: null,
      swapError: null,
    }),
});
