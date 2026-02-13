export enum ChainId {
  Solana = 'solana',
  Ethereum = 'ethereum',
  Base = 'base',
  Arbitrum = 'arbitrum',
}

export enum NetworkType {
  Mainnet = 'mainnet',
  Devnet = 'devnet',
}

export interface ChainConfig {
  id: ChainId;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  rpcUrls: Record<NetworkType, string>;
  explorerUrls: Record<NetworkType, string>;
}

export interface IChainProvider {
  chainId: ChainId;
  initialize(network: NetworkType): Promise<void>;
  getAddress(): string | null;
  getNativeBalance(address: string): Promise<number>;
  getTokenBalances(address: string): Promise<TokenBalanceInfo[]>;
  sendNativeToken(params: SendNativeParams): Promise<string>;
  sendToken(params: SendTokenParams): Promise<string>;
  getTransactionHistory(address: string, limit?: number): Promise<TransactionRecord[]>;
  getSwapQuote(params: SwapQuoteParams): Promise<SwapQuote>;
  executeSwap(params: ExecuteSwapParams): Promise<string>;
  isValidAddress(address: string): boolean;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
}

export interface TokenBalanceInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: number;
  uiBalance: number;
  icon?: string;
}

export interface SendNativeParams {
  from: string;
  to: string;
  amount: number;
  secretKey?: Uint8Array;
}

export interface SendTokenParams {
  from: string;
  to: string;
  mint: string;
  amount: number;
  decimals: number;
  secretKey?: Uint8Array;
}

export interface SwapQuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan: RoutePlanStep[];
  raw: unknown;
}

export interface RoutePlanStep {
  ammKey: string;
  label: string;
  inputMint: string;
  outputMint: string;
  percent: number;
}

export interface ExecuteSwapParams {
  quote: SwapQuote;
  userPublicKey: string;
  secretKey?: Uint8Array;
}

export interface TransactionRecord {
  signature: string;
  timestamp: number;
  type: 'send' | 'receive' | 'swap' | 'unknown';
  status: 'confirmed' | 'failed' | 'pending';
  amount?: number;
  token?: string;
  from?: string;
  to?: string;
}
