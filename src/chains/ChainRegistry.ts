import { ChainId, IChainProvider, NetworkType } from '@/types/chain';

class ChainRegistryClass {
  private providers = new Map<ChainId, IChainProvider>();

  register(chainId: ChainId, provider: IChainProvider) {
    this.providers.set(chainId, provider);
  }

  get(chainId: ChainId): IChainProvider {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`No provider registered for chain: ${chainId}`);
    }
    return provider;
  }

  has(chainId: ChainId): boolean {
    return this.providers.has(chainId);
  }

  async initializeAll(network: NetworkType) {
    const promises = Array.from(this.providers.values()).map((p) =>
      p.initialize(network)
    );
    await Promise.all(promises);
  }
}

export const ChainRegistry = new ChainRegistryClass();
