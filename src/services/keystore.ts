import { encrypt, decrypt } from './crypto';
import { EncryptedKeystore } from '@/types/wallet';
import { KEYSTORE_KEY } from '@/config/constants';

export async function saveKeystore(
  secretKeyBase58: string,
  password: string
): Promise<void> {
  const encrypted = await encrypt(secretKeyBase58, password);
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

export function hasKeystore(): boolean {
  return localStorage.getItem(KEYSTORE_KEY) !== null;
}

export function clearKeystore(): void {
  localStorage.removeItem(KEYSTORE_KEY);
}
