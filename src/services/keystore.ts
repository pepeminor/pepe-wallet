import { encrypt, decrypt } from './crypto';
import { EncryptedKeystore } from '@/types/wallet';
import { KEYSTORE_KEY, KEYSTORE_EVM_KEY } from '@/config/constants';

export async function saveKeystore(
  secretOrMnemonic: string,
  password: string
): Promise<void> {
  const encrypted = await encrypt(secretOrMnemonic, password);
  const keystore: EncryptedKeystore = {
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    salt: encrypted.salt,
  };
  localStorage.setItem(KEYSTORE_KEY, JSON.stringify(keystore));
}

export async function loadKeystore(password: string): Promise<string> {
  const raw = localStorage.getItem(KEYSTORE_KEY);
  if (!raw) throw new Error('No keystore found');

  const keystore: EncryptedKeystore = JSON.parse(raw);
  return decrypt(keystore.ciphertext, keystore.iv, keystore.salt, password);
}

export async function saveEvmKeystore(
  evmPrivateKey: string,
  password: string
): Promise<void> {
  const encrypted = await encrypt(evmPrivateKey, password);
  const keystore: EncryptedKeystore = {
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    salt: encrypted.salt,
  };
  localStorage.setItem(KEYSTORE_EVM_KEY, JSON.stringify(keystore));
}

export async function loadEvmKeystore(password: string): Promise<string> {
  const raw = localStorage.getItem(KEYSTORE_EVM_KEY);
  if (!raw) throw new Error('No EVM keystore found');

  const keystore: EncryptedKeystore = JSON.parse(raw);
  return decrypt(keystore.ciphertext, keystore.iv, keystore.salt, password);
}

export function hasEvmKeystore(): boolean {
  return localStorage.getItem(KEYSTORE_EVM_KEY) !== null;
}

/**
 * Detect whether the decrypted keystore value is a mnemonic (has spaces)
 * or a base58 private key (no spaces).
 */
export function isMnemonic(value: string): boolean {
  return value.includes(' ');
}

export function hasKeystore(): boolean {
  return localStorage.getItem(KEYSTORE_KEY) !== null;
}

export function clearKeystore(): void {
  localStorage.removeItem(KEYSTORE_KEY);
  localStorage.removeItem(KEYSTORE_EVM_KEY);
}
