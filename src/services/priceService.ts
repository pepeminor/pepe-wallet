import axios from 'axios';
import { TokenPrice } from '@/types/token';

const COINGECKO_TOKEN_PRICE =
  'https://api.coingecko.com/api/v3/simple/token_price/solana';

export async function getTokenPrices(mints: string[]): Promise<TokenPrice[]> {
  if (mints.length === 0) return [];

  try {
    const { data } = await axios.get(COINGECKO_TOKEN_PRICE, {
      params: {
        contract_addresses: mints.join(','),
        vs_currencies: 'usd',
      },
    });

    return mints.map((mint) => ({
      mint,
      priceUsd: data[mint]?.usd ?? 0,
    }));
  } catch (err) {
    console.error('Failed to fetch prices:', err);
    return mints.map((mint) => ({ mint, priceUsd: 0 }));
  }
}
