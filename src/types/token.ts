import { ChainId } from './chain';

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  icon?: string;
  chainId: ChainId;
  isNative: boolean;
}

export interface TokenBalance {
  token: TokenInfo;
  balance: number;
  uiBalance: number;
  usdValue?: number;
}

export interface TokenPrice {
  mint: string;
  priceUsd: number;
  change24h?: number;
}
