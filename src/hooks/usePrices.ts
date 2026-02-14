import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/store';
import { getTokenPrices } from '@/services/priceService';
import { PRICE_REFRESH_INTERVAL } from '@/config/constants';

const MANUAL_REFRESH_COOLDOWN = 15_000; // 15s

export function usePrices() {
  const balances = useStore((s) => s.balances);
  const activeChainId = useStore((s) => s.activeChainId);
  const prices = useStore((s) => s.prices);
  const setPrices = useStore((s) => s.setPrices);
  const setLastPriceFetch = useStore((s) => s.setLastPriceFetch);
  const fetchingRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  // Track which chain was last successfully fetched to avoid refetch on re-render
  const lastFetchedRef = useRef<string | null>(null);

  const fetchPrices = useCallback(async (mints: string[], symbolMap: Record<string, string>) => {
    if (fetchingRef.current || mints.length === 0) return;
    fetchingRef.current = true;
    try {
      const result = await getTokenPrices(mints, activeChainId, symbolMap);
      const map: Record<string, { mint: string; priceUsd: number }> = {};
      result.forEach((p) => {
        map[p.mint] = p;
      });
      setPrices(map);
      setLastPriceFetch(Date.now());
      lastFetchedRef.current = activeChainId;
    } finally {
      fetchingRef.current = false;
    }
  }, [setPrices, setLastPriceFetch, activeChainId]);

  // Build mints + symbol map from balances
  const getMintData = useCallback(() => {
    const mints = balances.map((b) => b.token.mint);
    const symbolMap: Record<string, string> = {};
    balances.forEach((b) => {
      symbolMap[b.token.mint] = b.token.symbol;
    });
    return { mints, symbolMap };
  }, [balances]);

  // Manual refresh with 15s cooldown
  const refresh = useCallback(async () => {
    if (cooldown || fetchingRef.current) return;
    const { mints, symbolMap } = getMintData();
    if (mints.length === 0) return;

    setRefreshing(true);
    setCooldown(true);
    await fetchPrices(mints, symbolMap);
    setRefreshing(false);
    setTimeout(() => setCooldown(false), MANUAL_REFRESH_COOLDOWN);
  }, [cooldown, fetchPrices, getMintData]);

  // Fetch when chain changes or balances load — retry if previous attempt was blocked
  useEffect(() => {
    const { mints, symbolMap } = getMintData();
    if (mints.length === 0) return;
    if (lastFetchedRef.current === activeChainId) return;

    // Small delay to avoid racing with in-flight fetches from the previous chain
    const timer = setTimeout(() => {
      fetchPrices(mints, symbolMap);
    }, 200);

    return () => clearTimeout(timer);
  }, [balances, activeChainId, fetchPrices, getMintData]);

  // Background refresh every 15 min
  useEffect(() => {
    const interval = setInterval(() => {
      const { mints, symbolMap } = getMintData();
      if (mints.length === 0) return;
      lastFetchedRef.current = null; // allow re-fetch
      fetchPrices(mints, symbolMap);
    }, PRICE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices, getMintData]);

  // Reset lastFetchedRef when chain changes so we fetch for the new chain
  useEffect(() => {
    lastFetchedRef.current = null;
  }, [activeChainId]);

  return { prices, refresh, refreshing, cooldown };
}
