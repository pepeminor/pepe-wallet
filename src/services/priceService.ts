import axios from 'axios';
import { TokenPrice } from '@/types/token';

const JUPITER_PRICE_API = 'https://price.jup.ag/v6/price';

export async function getTokenPrices(mints: string[]): Promise<TokenPrice[]> {
  if (mints.length === 0) return [];

  try {
    const { data } = await axios.get(JUPITER_PRICE_API, {
      params: { ids: mints.join(',') },
    });

    return mints.map((mint) => ({
      mint,
      priceUsd: data.data?.[mint]?.price ?? 0,
    }));
  } catch (err) {
    console.error('Failed to fetch prices:', err);
    return mints.map((mint) => ({ mint, priceUsd: 0 }));
  }
}
