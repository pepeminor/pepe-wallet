import { useEffect } from 'react';
import { useStore } from '@/store';
import { ChainRegistry } from '@/chains/ChainRegistry';
import { SolanaProvider } from '@/chains/solana';
import { EvmProvider } from '@/chains/evm';
import { ChainId, IChainProvider, NetworkType } from '@/types/chain';

// Register and initialize providers at module level to avoid race conditions
ChainRegistry.register(ChainId.Solana, new SolanaProvider());
ChainRegistry.register(ChainId.Ethereum, new EvmProvider(ChainId.Ethereum));
ChainRegistry.register(ChainId.Base, new EvmProvider(ChainId.Base));
ChainRegistry.register(ChainId.Arbitrum, new EvmProvider(ChainId.Arbitrum));

// Initialize with default network (will be re-initialized when useChainInit runs)
ChainRegistry.initializeAll(NetworkType.Mainnet);

export function useChainInit() {
  const network = useStore((s) => s.network);

  useEffect(() => {
    ChainRegistry.initializeAll(network);
  }, [network]);
}

export function useChainProvider(): IChainProvider | null {
  const activeChainId = useStore((s) => s.activeChainId);
  if (!ChainRegistry.has(activeChainId)) {
    console.warn('[useChainProvider] No provider for chain:', activeChainId);
    return null;
  }
  return ChainRegistry.get(activeChainId);
}
