import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/store';
import { getTokenPrices } from '@/services/priceService';
import { PRICE_REFRESH_INTERVAL } from '@/config/constants';

const MANUAL_REFRESH_COOLDOWN = 15_000; // 15s

// Module-level flag: resets only on full page refresh
let hasFetchedThisSession = false;

export function usePrices() {
  const balances = useStore((s) => s.balances);
  const prices = useStore((s) => s.prices);
  const setPrices = useStore((s) => s.setPrices);
  const setLastPriceFetch = useStore((s) => s.setLastPriceFetch);
  const fetchingRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const fetchPrices = useCallback(async (mints: string[]) => {
    if (fetchingRef.current || mints.length === 0) return;
    fetchingRef.current = true;
    try {
      const result = await getTokenPrices(mints);
      const map: Record<string, { mint: string; priceUsd: number }> = {};
      result.forEach((p) => {
        map[p.mint] = p;
      });
      setPrices(map);
      setLastPriceFetch(Date.now());
    } finally {
      fetchingRef.current = false;
    }
  }, [setPrices, setLastPriceFetch]);

  // Manual refresh with 15s cooldown
  const refresh = useCallback(async () => {
    if (cooldown || fetchingRef.current) return;
    const mints = balances.map((b) => b.token.mint);
    if (mints.length === 0) return;

    setRefreshing(true);
    setCooldown(true);
    await fetchPrices(mints);
    setRefreshing(false);
    setTimeout(() => setCooldown(false), MANUAL_REFRESH_COOLDOWN);
  }, [balances, cooldown, fetchPrices]);

  // Fetch once per page refresh session, skip if already have prices
  useEffect(() => {
    const mints = balances.map((b) => b.token.mint);
    if (mints.length === 0 || hasFetchedThisSession) return;

    const hasExistingPrices = Object.keys(prices).length > 0;
    if (hasExistingPrices) {
      hasFetchedThisSession = true;
      return;
    }

    hasFetchedThisSession = true;
    fetchPrices(mints);
  }, [balances]);

  // Background refresh every 15 min
  useEffect(() => {
    const mints = balances.map((b) => b.token.mint);
    if (mints.length === 0) return;

    const interval = setInterval(() => fetchPrices(mints), PRICE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [balances, fetchPrices]);

  return { prices, refresh, refreshing, cooldown };
}
