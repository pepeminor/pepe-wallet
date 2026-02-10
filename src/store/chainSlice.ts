import { StateCreator } from 'zustand';
import { ChainId, NetworkType, IChainProvider } from '@/types/chain';
import { ChainRegistry } from '@/chains/ChainRegistry';

export interface ChainSlice {
  activeChainId: ChainId;
  network: NetworkType;

  setActiveChain: (chainId: ChainId) => void;
  setNetwork: (network: NetworkType) => void;
  getProvider: () => IChainProvider;
}

export const createChainSlice: StateCreator<ChainSlice, [], [], ChainSlice> = (
  set,
  get
) => ({
  activeChainId: ChainId.Solana,
  network: NetworkType.Devnet,

  setActiveChain: (activeChainId) => set({ activeChainId }),
  setNetwork: (network) => set({ network }),
  getProvider: () => ChainRegistry.get(get().activeChainId),
});
