import { create } from 'zustand';
import { WalletSlice, createWalletSlice } from './walletSlice';
import { ChainSlice, createChainSlice } from './chainSlice';
import { UiSlice, createUiSlice } from './uiSlice';
import { SwapSlice, createSwapSlice } from './swapSlice';
import { TransactionSlice, createTransactionSlice } from './transactionSlice';

export type AppStore = WalletSlice &
  ChainSlice &
  UiSlice &
  SwapSlice &
  TransactionSlice;

export const useStore = create<AppStore>()((...a) => ({
  ...createWalletSlice(...a),
  ...createChainSlice(...a),
  ...createUiSlice(...a),
  ...createSwapSlice(...a),
  ...createTransactionSlice(...a),
}));
