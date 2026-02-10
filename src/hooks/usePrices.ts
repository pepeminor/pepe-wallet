import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { getTokenPrices } from '@/services/priceService';
import { TokenPrice } from '@/types/token';
import { PRICE_REFRESH_INTERVAL } from '@/config/constants';

export function usePrices() {
  const balances = useStore((s) => s.balances);
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});

  useEffect(() => {
    const mints = balances.map((b) => b.token.mint);
    if (mints.length === 0) return;

    const fetchPrices = async () => {
      const result = await getTokenPrices(mints);
      const map: Record<string, TokenPrice> = {};
      result.forEach((p) => {
        map[p.mint] = p;
      });
      setPrices(map);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, PRICE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [balances]);

  return prices;
}
