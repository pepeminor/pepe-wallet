import { StateCreator } from 'zustand';
import { TransactionInfo } from '@/types/transaction';

export interface TransactionSlice {
  history: TransactionInfo[];
  pendingSignatures: string[];
  historyLoading: boolean;

  setHistory: (history: TransactionInfo[]) => void;
  addPending: (signature: string) => void;
  removePending: (signature: string) => void;
  setHistoryLoading: (loading: boolean) => void;
}

export const createTransactionSlice: StateCreator<
  TransactionSlice,
  [],
  [],
  TransactionSlice
> = (set) => ({
  history: [],
  pendingSignatures: [],
  historyLoading: false,

  setHistory: (history) => set({ history }),
  addPending: (signature) =>
    set((state) => ({
      pendingSignatures: [...state.pendingSignatures, signature],
    })),
  removePending: (signature) =>
    set((state) => ({
      pendingSignatures: state.pendingSignatures.filter((s) => s !== signature),
    })),
  setHistoryLoading: (historyLoading) => set({ historyLoading }),
});
