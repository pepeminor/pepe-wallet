import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/store';
import { getTokenPrices } from '@/services/priceService';
import { PRICE_REFRESH_INTERVAL } from '@/config/constants';

const MANUAL_REFRESH_COOLDOWN = 15_000; // 15s

// Track per-chain whether we've fetched this session
const fetchedChains = new Set<string>();

export function usePrices() {
  const balances = useStore((s) => s.balances);
  const activeChainId = useStore((s) => s.activeChainId);
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
      const result = await getTokenPrices(mints, activeChainId);
      const map: Record<string, { mint: string; priceUsd: number }> = {};
      result.forEach((p) => {
        map[p.mint] = p;
      });
      setPrices(map);
      setLastPriceFetch(Date.now());
    } finally {
      fetchingRef.current = false;
    }
  }, [setPrices, setLastPriceFetch, activeChainId]);

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

  // Fetch once per chain per session, skip if already have prices
  useEffect(() => {
    const mints = balances.map((b) => b.token.mint);
    if (mints.length === 0 || fetchedChains.has(activeChainId)) return;

    fetchedChains.add(activeChainId);
    fetchPrices(mints);
  }, [balances, activeChainId, fetchPrices]);

  // Background refresh every 15 min
  useEffect(() => {
    const mints = balances.map((b) => b.token.mint);
    if (mints.length === 0) return;

    const interval = setInterval(() => fetchPrices(mints), PRICE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [balances, fetchPrices]);

  return { prices, refresh, refreshing, cooldown };
}
