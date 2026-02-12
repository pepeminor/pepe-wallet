import { StateCreator } from 'zustand';
import { TokenPrice } from '@/types/token';

export interface PriceSlice {
  prices: Record<string, TokenPrice>;
  lastPriceFetch: number;
  setPrices: (prices: Record<string, TokenPrice>) => void;
  setLastPriceFetch: (ts: number) => void;
}

export const createPriceSlice: StateCreator<PriceSlice, [], [], PriceSlice> = (
  set
) => ({
  prices: {},
  lastPriceFetch: 0,
  setPrices: (prices) => set({ prices }),
  setLastPriceFetch: (ts) => set({ lastPriceFetch: ts }),
});
