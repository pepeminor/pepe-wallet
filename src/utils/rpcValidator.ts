/**
 * RPC URL Validator - Ensures all RPC endpoints use HTTPS
 *
 * Security features:
 * - Enforces HTTPS protocol
 * - Validates URL format
 * - Optional allowlist of trusted hosts
 * - Prevents MITM attacks
 */

// Trusted RPC hosts (optional allowlist)
const TRUSTED_RPC_HOSTS = [
  'api.devnet.solana.com',
  'api.mainnet-beta.solana.com',
  'solana-rpc.publicnode.com',
  'ethereum-rpc.publicnode.com',
  'quote-api.jup.ag',
  'price.jup.ag',
  'api.coingecko.com',
];

/**
 * Validate that an RPC URL uses HTTPS
 * @param url - The RPC URL to validate
 * @param name - Descriptive name for error messages
 * @param enforceAllowlist - Whether to check against trusted hosts list
 * @returns The validated URL
 * @throws Error if validation fails
 */
export function validateRpcUrl(
  url: string,
  name: string = 'RPC endpoint',
  enforceAllowlist: boolean = false
): string {
  // Check if URL is provided
  if (!url || typeof url !== 'string') {
    throw new Error(`${name} URL is required`);
  }

  // ✅ SECURITY FIX: Enforce HTTPS only
  if (!url.startsWith('https://')) {
    throw new Error(
      `${name} must use HTTPS for secure communication. ` +
      `Got: ${url.substring(0, 50)}...`
    );
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    throw new Error(`Invalid URL format for ${name}: ${url}`);
  }

  // Check protocol (redundant but explicit)
  if (parsedUrl.protocol !== 'https:') {
    throw new Error(`${name} must use HTTPS protocol. Got: ${parsedUrl.protocol}`);
  }

  // Optional: Check against allowlist
  if (enforceAllowlist && !TRUSTED_RPC_HOSTS.includes(parsedUrl.hostname)) {
    console.warn(
      `⚠️ Warning: Using non-standard RPC host for ${name}: ${parsedUrl.hostname}. ` +
      `Trusted hosts: ${TRUSTED_RPC_HOSTS.join(', ')}`
    );
  }

  return url;
}

/**
 * Validate multiple RPC URLs
 * @param urls - Object with URL name as key and URL as value
 * @param enforceAllowlist - Whether to check against trusted hosts list
 * @returns Validated URLs object
 */
export function validateRpcUrls(
  urls: Record<string, string>,
  enforceAllowlist: boolean = false
): Record<string, string> {
  const validated: Record<string, string> = {};

  for (const [name, url] of Object.entries(urls)) {
    validated[name] = validateRpcUrl(url, name, enforceAllowlist);
  }

  return validated;
}

/**
 * Check if a URL is HTTPS without throwing
 * @param url - The URL to check
 * @returns true if HTTPS, false otherwise
 */
export function isHttpsUrl(url: string): boolean {
  try {
    return url.startsWith('https://') && new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}
