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
  [ChainId.Ethereum]: {
    id: ChainId.Ethereum,
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    icon: '/chains/ethereum.svg',
    rpcUrls: {
      [NetworkType.Mainnet]: ENV.ETHEREUM_RPC,
      [NetworkType.Devnet]: ENV.ETHEREUM_RPC,
    },
    explorerUrls: {
      [NetworkType.Mainnet]: 'https://etherscan.io',
      [NetworkType.Devnet]: 'https://etherscan.io',
    },
  },
  [ChainId.Base]: {
    id: ChainId.Base,
    name: 'Base',
    symbol: 'ETH',
    decimals: 18,
    icon: '/chains/base.svg',
    rpcUrls: {
      [NetworkType.Mainnet]: ENV.BASE_RPC,
      [NetworkType.Devnet]: ENV.BASE_RPC,
    },
    explorerUrls: {
      [NetworkType.Mainnet]: 'https://basescan.org',
      [NetworkType.Devnet]: 'https://basescan.org',
    },
  },
  [ChainId.Arbitrum]: {
    id: ChainId.Arbitrum,
    name: 'Arbitrum',
    symbol: 'ETH',
    decimals: 18,
    icon: '/chains/arbitrum.svg',
    rpcUrls: {
      [NetworkType.Mainnet]: ENV.ARBITRUM_RPC,
      [NetworkType.Devnet]: ENV.ARBITRUM_RPC,
    },
    explorerUrls: {
      [NetworkType.Mainnet]: 'https://arbiscan.io',
      [NetworkType.Devnet]: 'https://arbiscan.io',
    },
  },
};
