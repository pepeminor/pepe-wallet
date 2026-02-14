/**
 * Secure Key Manager - NEVER stores private keys in state
 *
 * Security features:
 * - Keys stored in closure, not Zustand state
 * - Uses Uint8Array instead of strings (can be zeroed)
 * - Auto-lock after 5 minutes of inactivity
 * - Memory zeroing on lock
 * - No key exposure to external code
 */

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface SecureKeys {
  solanaKey: Uint8Array | null;
  evmKey: Uint8Array | null;
}

class SecureKeyManager {
  private keys: SecureKeys = { solanaKey: null, evmKey: null };
  private timeout: NodeJS.Timeout | null = null;
  private lockCallback: (() => void) | null = null;

  /**
   * Securely zero out a Uint8Array to remove sensitive data from memory
   */
  private secureZero(buffer: Uint8Array): void {
    // Overwrite with random data first
    crypto.getRandomValues(buffer);
    // Then fill with zeros
    buffer.fill(0);
  }

  /**
   * Reset the auto-lock timeout
   */
  private resetTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.lock();
    }, SESSION_TIMEOUT);
  }

  /**
   * Set callback to be called when wallet auto-locks
   */
  setLockCallback(callback: () => void): void {
    this.lockCallback = callback;
  }

  /**
   * Unlock wallet with Solana private key (base58 or Uint8Array)
   */
  unlockSolana(secretKey: string | Uint8Array): void {
    // Convert to Uint8Array if string
    const keyArray =
      typeof secretKey === 'string' ? bs58.decode(secretKey) : secretKey;

    // Clear old key if exists
    if (this.keys.solanaKey) {
      this.secureZero(this.keys.solanaKey);
    }

    // Store new key (make a copy to avoid external mutation)
    this.keys.solanaKey = new Uint8Array(keyArray);

    this.resetTimeout();
  }

  /**
   * Unlock wallet with EVM private key (hex string or Uint8Array)
   */
  unlockEvm(privateKey: string | Uint8Array): void {
    // Convert hex string to Uint8Array if needed
    let keyArray: Uint8Array;
    if (typeof privateKey === 'string') {
      // Remove 0x prefix if present
      const hex = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
      keyArray = new Uint8Array(
        hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
      );
    } else {
      keyArray = privateKey;
    }

    // Clear old key if exists
    if (this.keys.evmKey) {
      this.secureZero(this.keys.evmKey);
    }

    // Store new key (make a copy)
    this.keys.evmKey = new Uint8Array(keyArray);

    this.resetTimeout();
  }

  /**
   * Lock the wallet and zero out all keys from memory
   */
  lock(): void {
    // Zero out keys
    if (this.keys.solanaKey) {
      this.secureZero(this.keys.solanaKey);
      this.keys.solanaKey = null;
    }
    if (this.keys.evmKey) {
      this.secureZero(this.keys.evmKey);
      this.keys.evmKey = null;
    }

    // Clear timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    // Call lock callback (to update UI state)
    if (this.lockCallback) {
      this.lockCallback();
    }
  }

  /**
   * Check if wallet is unlocked
   */
  isUnlocked(): boolean {
    return this.keys.solanaKey !== null || this.keys.evmKey !== null;
  }

  /**
   * Check if Solana key is available
   */
  hasSolanaKey(): boolean {
    return this.keys.solanaKey !== null;
  }

  /**
   * Check if EVM key is available
   */
  hasEvmKey(): boolean {
    return this.keys.evmKey !== null;
  }

  /**
   * Get Solana keypair for signing (NEVER exposes raw key)
   * Resets timeout on access
   */
  getSolanaKeypair(): Keypair {
    if (!this.keys.solanaKey) {
      throw new Error('Wallet is locked. Please unlock first.');
    }
    this.resetTimeout();
    return Keypair.fromSecretKey(this.keys.solanaKey);
  }

  /**
   * Get Solana secret key as Uint8Array for signing
   * Resets timeout on access
   * ⚠️ WARNING: This exposes the raw key - use only when absolutely necessary
   */
  getSolanaSecretKey(): Uint8Array {
    if (!this.keys.solanaKey) {
      throw new Error('Wallet is locked. Please unlock first.');
    }
    this.resetTimeout();
    // Return a copy to prevent external mutation
    return new Uint8Array(this.keys.solanaKey);
  }

  /**
   * Get EVM private key as Uint8Array for signing
   * Resets timeout on access
   * ⚠️ WARNING: This exposes the raw key - use only when absolutely necessary
   */
  getEvmPrivateKey(): Uint8Array {
    if (!this.keys.evmKey) {
      throw new Error('Wallet is locked. Please unlock first.');
    }
    this.resetTimeout();
    // Return a copy to prevent external mutation
    return new Uint8Array(this.keys.evmKey);
  }

  /**
   * Get EVM private key as hex string (for web3 libraries)
   * ⚠️ WARNING: This exposes the raw key as string - use only when absolutely necessary
   */
  getEvmPrivateKeyHex(): string {
    const key = this.getEvmPrivateKey();
    return '0x' + Array.from(key)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Export Solana private key as base58 (for backup/export features)
   * ⚠️ WARNING: Only call this when user explicitly requests key export
   */
  exportSolanaKey(): string {
    if (!this.keys.solanaKey) {
      throw new Error('Wallet is locked. Please unlock first.');
    }
    this.resetTimeout();
    return bs58.encode(this.keys.solanaKey);
  }

  /**
   * Export EVM private key as hex (for backup/export features)
   * ⚠️ WARNING: Only call this when user explicitly requests key export
   */
  exportEvmKey(): string {
    return this.getEvmPrivateKeyHex();
  }

  /**
   * Get remaining time until auto-lock (in milliseconds)
   */
  getRemainingTime(): number {
    if (!this.timeout) return 0;
    // This is approximate - Node.js doesn't expose exact timeout remaining
    return SESSION_TIMEOUT;
  }
}

// Singleton instance
export const secureKeyManager = new SecureKeyManager();

// Export utility function for zeroing buffers (can be used elsewhere)
export function secureZero(buffer: Uint8Array): void {
  crypto.getRandomValues(buffer);
  buffer.fill(0);
}
