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

export async function getTokenPrices(
  mints: string[],
  chainId: ChainId = ChainId.Solana
): Promise<TokenPrice[]> {
  if (mints.length === 0) return [];

  const nativeMint = chainId === ChainId.Solana ? NATIVE_SOL_MINT : NATIVE_ETH_MINT;
  const hasNative = mints.includes(nativeMint);
  const contractMints = mints.filter((m) => m !== nativeMint);

  const results: TokenPrice[] = [];

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

    // Fetch ERC-20 / SPL token prices
    if (contractMints.length > 0) {
      const platform = COINGECKO_PLATFORM[chainId];
      const { data } = await axios.get(
        `${COINGECKO_BASE}/simple/token_price/${platform}`,
        {
          params: {
            contract_addresses: contractMints.join(','),
            // ids: contractMints.join(','),
            vs_currencies: 'usd',
          },
        }
      );

      for (const mint of contractMints) {
        const key = mint.toLowerCase();
        results.push({
          mint,
          priceUsd: data[key]?.usd ?? 0,
        });
      }
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
