import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/store';
import { getTokenPrices } from '@/services/priceService';
import { PRICE_REFRESH_INTERVAL } from '@/config/constants';

const MANUAL_REFRESH_COOLDOWN = 15_000; // 15s
const PRICE_STALE_TIME = 10 * 60_000; // 10 minutes

export function usePrices() {
  const balances = useStore((s) => s.balances);
  const activeChainId = useStore((s) => s.activeChainId);
  const isLocked = useStore((s) => s.isLocked);
  const prices = useStore((s) => s.prices);
  const lastPriceFetch = useStore((s) => s.lastPriceFetch);
  const setPrices = useStore((s) => s.setPrices);
  const setLastPriceFetch = useStore((s) => s.setLastPriceFetch);
  const fetchingRef = useRef(false);
  const prevLockedRef = useRef(true); // Init as locked - will trigger fetch on first unlock
  const [refreshing, setRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const fetchPrices = useCallback(async (mints: string[], symbolMap: Record<string, string>, force = false) => {
    if (fetchingRef.current || mints.length === 0 || isLocked) return;

    // Skip if data is fresh (unless forced)
    if (!force) {
      const age = Date.now() - lastPriceFetch;
      if (age < PRICE_STALE_TIME) {
        return;
      }
    }

    fetchingRef.current = true;
    try {
      const result = await getTokenPrices(mints, activeChainId, symbolMap);
      const map: Record<string, { mint: string; priceUsd: number }> = {};
      result.forEach((p) => {
        map[p.mint] = p;
      });
      setPrices(map);
      setLastPriceFetch(Date.now());
    } finally {
      fetchingRef.current = false;
    }
  }, [setPrices, setLastPriceFetch, activeChainId, isLocked, lastPriceFetch]);

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
    await fetchPrices(mints, symbolMap, true); // force=true
    setRefreshing(false);
    setTimeout(() => setCooldown(false), MANUAL_REFRESH_COOLDOWN);
  }, [cooldown, fetchPrices, getMintData]);

  // On unlock: force fetch fresh prices
  useEffect(() => {
    if (prevLockedRef.current && !isLocked) {
      // Just unlocked - force fetch
      const { mints, symbolMap } = getMintData();
      if (mints.length > 0) {
        fetchPrices(mints, symbolMap, true);
      }
    }
    prevLockedRef.current = isLocked;
  }, [isLocked, fetchPrices, getMintData]);

  // Background polling - only fetch if data is stale
  useEffect(() => {
    if (isLocked) return;

    const { mints, symbolMap } = getMintData();
    if (mints.length === 0) return;

    // Check immediately if we need to fetch
    fetchPrices(mints, symbolMap);

    // Then check periodically
    const interval = setInterval(() => {
      const { mints: currentMints, symbolMap: currentSymbolMap } = getMintData();
      if (currentMints.length > 0) {
        fetchPrices(currentMints, currentSymbolMap);
      }
    }, PRICE_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchPrices, getMintData, isLocked]);

  return { prices, refresh, refreshing, cooldown };
}
