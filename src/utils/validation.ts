import { PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import bs58 from 'bs58';

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function isValidEvmAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export function isValidAmount(amount: string, maxBalance: number): boolean {
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return false;
  return num <= maxBalance;
}

export function isValidPrivateKey(key: string): boolean {
  try {
    const decoded = bs58.decode(key);
    return decoded.length === 64;
  } catch {
    return false;
  }
}
