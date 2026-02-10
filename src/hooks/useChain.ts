import { useEffect } from 'react';
import { useStore } from '@/store';
import { ChainRegistry } from '@/chains/ChainRegistry';
import { SolanaProvider } from '@/chains/solana';
import { ChainId, IChainProvider } from '@/types/chain';

let initialized = false;

export function useChainInit() {
  const network = useStore((s) => s.network);

  useEffect(() => {
    if (!initialized) {
      ChainRegistry.register(ChainId.Solana, new SolanaProvider());
      initialized = true;
    }
    ChainRegistry.initializeAll(network);
  }, [network]);
}

export function useChainProvider(): IChainProvider | null {
  const activeChainId = useStore((s) => s.activeChainId);
  if (!ChainRegistry.has(activeChainId)) return null;
  return ChainRegistry.get(activeChainId);
}
