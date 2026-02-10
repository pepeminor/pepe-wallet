import { TokenInfo } from '@/types/token';
import { ChainId } from '@/types/chain';
import { NATIVE_SOL_MINT } from './constants';

export const DEFAULT_TOKENS: Record<ChainId, TokenInfo[]> = {
  [ChainId.Solana]: [
    {
      mint: NATIVE_SOL_MINT,
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      icon: '/tokens/sol.svg',
      chainId: ChainId.Solana,
      isNative: true,
    },
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: '/tokens/usdc.svg',
      chainId: ChainId.Solana,
      isNative: false,
    },
    {
      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      icon: '/tokens/usdt.svg',
      chainId: ChainId.Solana,
      isNative: false,
    },
  ],
};
