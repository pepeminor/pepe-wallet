import { StateCreator } from 'zustand';
import { TokenInfo } from '@/types/token';
import { JupiterQuoteResponse } from '@/types/swap';
import { DEFAULT_SLIPPAGE_BPS } from '@/config/constants';

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
  setSlippage: (slippageBps) => set({ slippageBps }),
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
