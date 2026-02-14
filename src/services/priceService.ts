import axios from 'axios';
import { TokenPrice } from '@/types/token';
import { ChainId } from '@/types/chain';
import { NATIVE_ETH_MINT, NATIVE_SOL_MINT } from '@/config/constants';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

const COINGECKO_PLATFORM: Record<ChainId, string> = {
  [ChainId.Solana]: 'solana',
  [ChainId.Ethereum]: 'ethereum',
  [ChainId.Base]: 'base',
  [ChainId.Arbitrum]: 'arbitrum-one',
};

// CoinGecko IDs for native tokens
const NATIVE_COINGECKO_IDS: Record<ChainId, string> = {
  [ChainId.Solana]: 'solana',
  [ChainId.Ethereum]: 'ethereum',
  [ChainId.Base]: 'ethereum',
  [ChainId.Arbitrum]: 'ethereum',
};

// Stablecoins pegged to $1 — skip API calls for these
const STABLECOIN_SYMBOLS = new Set(['USDT', 'USDC', 'DAI', 'BUSD']);

async function fetchSingleTokenPrice(
  mint: string,
  platform: string
): Promise<number> {
  try {
    const { data } = await axios.get(
      `${COINGECKO_BASE}/simple/token_price/${platform}`,
      {
        params: {
          contract_addresses: mint,
          vs_currencies: 'usd',
        },
      }
    );
    const key = mint.toLowerCase();
    return data[key]?.usd ?? 0;
  } catch {
    return 0;
  }
}

export async function getTokenPrices(
  mints: string[],
  chainId: ChainId = ChainId.Solana,
  symbols?: Record<string, string>
): Promise<TokenPrice[]> {
  if (mints.length === 0) return [];

  const nativeMint = chainId === ChainId.Solana ? NATIVE_SOL_MINT : NATIVE_ETH_MINT;
  const hasNative = mints.includes(nativeMint);

  const results: TokenPrice[] = [];

  // Separate stablecoins from tokens that need API calls
  const contractMints: string[] = [];
  for (const mint of mints) {
    if (mint === nativeMint) continue;
    const sym = symbols?.[mint]?.toUpperCase();
    if (sym && STABLECOIN_SYMBOLS.has(sym)) {
      results.push({ mint, priceUsd: 1 });
    } else {
      contractMints.push(mint);
    }
  }

  try {
    // Fetch native token price
    if (hasNative) {
      const nativeId = NATIVE_COINGECKO_IDS[chainId];
      const { data } = await axios.get(`${COINGECKO_BASE}/simple/price`, {
        params: { ids: nativeId, vs_currencies: 'usd' },
      });
      results.push({
        mint: nativeMint,
        priceUsd: data[nativeId]?.usd ?? 0,
      });
    }

    // Fetch contract token prices one at a time (CoinGecko free tier limitation)
    if (contractMints.length > 0) {
      const platform = COINGECKO_PLATFORM[chainId];
      const pricePromises = contractMints.map(async (mint) => {
        const priceUsd = await fetchSingleTokenPrice(mint, platform);
        return { mint, priceUsd };
      });

      const tokenPrices = await Promise.all(pricePromises);
      results.push(...tokenPrices);
    }
  } catch (err) {
    console.error('Failed to fetch prices:', err);
    return mints.map((mint) => ({ mint, priceUsd: 0 }));
  }

  // Add zeros for any mints we didn't get prices for
  for (const mint of mints) {
    if (!results.find((r) => r.mint === mint)) {
      results.push({ mint, priceUsd: 0 });
    }
  }

  return results;
}
