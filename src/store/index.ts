import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletSlice, createWalletSlice } from './walletSlice';
import { ChainSlice, createChainSlice } from './chainSlice';
import { UiSlice, createUiSlice } from './uiSlice';
import { SwapSlice, createSwapSlice } from './swapSlice';
import { TransactionSlice, createTransactionSlice } from './transactionSlice';
import { PriceSlice, createPriceSlice } from './priceSlice';

export type AppStore = WalletSlice &
  ChainSlice &
  UiSlice &
  SwapSlice &
  TransactionSlice &
  PriceSlice;

export const useStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createWalletSlice(...a),
      ...createChainSlice(...a),
      ...createUiSlice(...a),
      ...createSwapSlice(...a),
      ...createTransactionSlice(...a),
      ...createPriceSlice(...a),
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        mode: state.mode,
        accounts: state.accounts,
        activeAccount: state.activeAccount,
        isInitialized: state.isInitialized,
        isLocked: true,
        prices: state.prices,
        lastPriceFetch: state.lastPriceFetch,
      }),
    }
  )
);
