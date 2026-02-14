import { StateCreator } from 'zustand';
import { WalletMode, WalletAccount } from '@/types/wallet';
import { TokenBalance } from '@/types/token';

export interface WalletSlice {
  mode: WalletMode | null;
  accounts: WalletAccount[];
  activeAccount: WalletAccount | null;
  balances: TokenBalance[];
  balanceCache: Record<string, TokenBalance[]>;
  lastBalanceFetch: Record<string, number>; // Track last fetch time per chain
  isLocked: boolean;
  isInitialized: boolean;
  secretKeyBase58: string | null;
  evmPrivateKey: string | null;
  hasExportedKeys: boolean;

  setMode: (mode: WalletMode) => void;
  addAccount: (account: WalletAccount) => void;
  setActiveAccount: (account: WalletAccount) => void;
  setBalances: (balances: TokenBalance[]) => void;
  setChainBalances: (chainId: string, balances: TokenBalance[]) => void;
  restoreBalancesFromCache: (chainId: string) => void;
  setLocked: (locked: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setSecretKey: (key: string | null) => void;
  setEvmPrivateKey: (key: string | null) => void;
  setHasExportedKeys: (exported: boolean) => void;
  updateActiveAccount: (patch: Partial<WalletAccount>) => void;
  reset: () => void;
}

const initialState = {
  mode: null,
  accounts: [],
  activeAccount: null,
  balances: [],
  balanceCache: {} as Record<string, TokenBalance[]>,
  lastBalanceFetch: {} as Record<string, number>,
  isLocked: true,
  isInitialized: false,
  secretKeyBase58: null,
  evmPrivateKey: null,
  hasExportedKeys: false,
};

export const createWalletSlice: StateCreator<WalletSlice, [], [], WalletSlice> = (
  set
) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),
  addAccount: (account) =>
    set((state) => ({ accounts: [...state.accounts, account] })),
  setActiveAccount: (account) => set({ activeAccount: account }),
  setBalances: (balances) => set({ balances }),
  setChainBalances: (chainId, balances) =>
    set((state) => ({
      balances,
      balanceCache: { ...state.balanceCache, [chainId]: balances },
      lastBalanceFetch: { ...state.lastBalanceFetch, [chainId]: Date.now() },
    })),
  restoreBalancesFromCache: (chainId) =>
    set((state) => ({
      balances: state.balanceCache[chainId] ?? [],
    })),
  setLocked: (isLocked) => set({ isLocked }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setSecretKey: (secretKeyBase58) => set({ secretKeyBase58 }),
  setEvmPrivateKey: (evmPrivateKey) => set({ evmPrivateKey }),
  setHasExportedKeys: (hasExportedKeys) => set({ hasExportedKeys }),
  updateActiveAccount: (patch) =>
    set((state) => {
      if (!state.activeAccount) return state;
      const updated = { ...state.activeAccount, ...patch };
      return {
        activeAccount: updated,
        accounts: state.accounts.map((a) =>
          a.address === state.activeAccount?.address &&
          a.evmAddress === state.activeAccount?.evmAddress
            ? updated
            : a
        ),
      };
    }),
  reset: () => set(initialState),
});
