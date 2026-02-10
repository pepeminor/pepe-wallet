import { ChainId, ChainConfig, NetworkType } from '@/types/chain';
import { ENV } from './env';

export const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  [ChainId.Solana]: {
    id: ChainId.Solana,
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    icon: '/chains/solana.svg',
    rpcUrls: {
      [NetworkType.Devnet]: ENV.SOLANA_RPC_DEVNET,
      [NetworkType.Mainnet]: ENV.SOLANA_RPC_MAINNET,
    },
    explorerUrls: {
      [NetworkType.Devnet]: 'https://explorer.solana.com/?cluster=devnet',
      [NetworkType.Mainnet]: 'https://explorer.solana.com',
    },
  },
};
