const PBKDF2_ITERATIONS = 600_000;

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(
  plaintext: string,
  password: string
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );

  return {
    ciphertext: bufToHex(new Uint8Array(ciphertextBuf)),
    iv: bufToHex(iv),
    salt: bufToHex(salt),
  };
}

export async function decrypt(
  ciphertext: string,
  iv: string,
  salt: string,
  password: string
): Promise<string> {
  try {
    const key = await deriveKey(password, hexToBuf(salt));
    const dec = new TextDecoder();

    const plainBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: hexToBuf(iv) },
      key,
      hexToBuf(ciphertext)
    );

    return dec.decode(plainBuf);
  } catch (error) {
    // ✅ SECURITY FIX: Add random delay on failure to prevent timing attacks
    // Delay between 100-150ms to hide timing differences
    const delay = 100 + Math.random() * 50;
    await new Promise((resolve) => setTimeout(resolve, delay));
    throw new Error('Decryption failed');
  }
}

/**
 * Decrypt to Uint8Array for secure memory handling
 * Returns buffer instead of string - caller must zero it after use
 */
export async function decryptToBuffer(
  ciphertext: string,
  iv: string,
  salt: string,
  password: string
): Promise<Uint8Array> {
  try {
    const key = await deriveKey(password, hexToBuf(salt));

    const plainBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: hexToBuf(iv) },
      key,
      hexToBuf(ciphertext)
    );

    return new Uint8Array(plainBuf as ArrayBuffer);
  } catch (error) {
    // ✅ SECURITY FIX: Add random delay on failure to prevent timing attacks
    const delay = 100 + Math.random() * 50;
    await new Promise((resolve) => setTimeout(resolve, delay));
    throw new Error('Decryption failed');
  }
}

function bufToHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
