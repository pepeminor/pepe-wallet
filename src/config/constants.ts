import { ChainId } from '@/types/chain';

export const APP_NAME = 'Pepe Bag';
export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
export const LAMPORTS_PER_SOL = 1_000_000_000;
export const SOL_DECIMALS = 9;
export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
export const ASSOCIATED_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
export const NATIVE_SOL_MINT = 'So11111111111111111111111111111111111111112';
export const NATIVE_ETH_MINT = '0x0000000000000000000000000000000000000000';
export const KEYSTORE_KEY = 'sol_wallet_keystore';
export const KEYSTORE_EVM_KEY = 'evm_wallet_keystore';
export const PASSWORD_SALT_KEY = 'sol_wallet_salt';
export const PRICE_REFRESH_INTERVAL = 15 * 60_000; // 15 minutes
export const BALANCE_REFRESH_INTERVAL = 60_000; // 1 minute

export const EVM_CHAIN_IDS: ChainId[] = [
  ChainId.Ethereum,
  ChainId.Base,
  ChainId.Arbitrum,
];

export function isEvmChain(chainId: ChainId): boolean {
  return EVM_CHAIN_IDS.includes(chainId);
}

export function getNativeMint(chainId: ChainId): string {
  return chainId === ChainId.Solana ? NATIVE_SOL_MINT : NATIVE_ETH_MINT;
}
