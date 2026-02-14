import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store';
import { useChainProvider } from './useChain';
import { DEFAULT_TOKENS } from '@/config/tokens';
import { BALANCE_REFRESH_INTERVAL, isEvmChain } from '@/config/constants';
import { TokenBalance } from '@/types/token';

const STALE_TIME = 5 * 60_000; // 5 minutes - only fetch if data older than this

export function useBalances() {
  const activeAccount = useStore((s) => s.activeAccount);
  const activeChainId = useStore((s) => s.activeChainId);
  const isLocked = useStore((s) => s.isLocked);
  const setChainBalances = useStore((s) => s.setChainBalances);
  const restoreBalancesFromCache = useStore((s) => s.restoreBalancesFromCache);
  const lastBalanceFetch = useStore((s) => s.lastBalanceFetch);
  const balances = useStore((s) => s.balances);

  const provider = useChainProvider();
  const prevChainRef = useRef(activeChainId);
  const prevLockedRef = useRef(true); // Init as locked - will trigger fetch on first unlock
  const fetchIdRef = useRef(0);

  // On chain switch: restore cached balances immediately (no fetch)
  useEffect(() => {
    if (prevChainRef.current !== activeChainId) {
      restoreBalancesFromCache(activeChainId);
      prevChainRef.current = activeChainId;
    }
  }, [activeChainId, restoreBalancesFromCache]);

  const fetchBalances = useCallback(async (force = false) => {
    if (!activeAccount) {
      return;
    }
    if (!provider) {
      return;
    }
    if (isLocked) {
      return;
    }

    // Skip if data is fresh (unless forced)
    if (!force) {
      const lastFetch = lastBalanceFetch[activeChainId] ?? 0;
      const age = Date.now() - lastFetch;
      if (age < STALE_TIME) {
        return;
      }
    }

    const address = isEvmChain(activeChainId)
      ? activeAccount.evmAddress
      : activeAccount.address;

    if (!address) {
      return;
    }


    // Track this fetch so we can discard stale results
    const currentFetchId = ++fetchIdRef.current;
    const chainAtFetch = activeChainId;

    try {
      const chainBalances = await provider.getTokenBalances(address);

      // Discard if chain changed during fetch
      if (fetchIdRef.current !== currentFetchId) {
        return;
      }

      const defaultTokens = DEFAULT_TOKENS[chainAtFetch] ?? [];

      const tokenBalances: TokenBalance[] = chainBalances.map((b) => {
        const tokenInfo = defaultTokens.find((t) => t.mint === b.mint) ?? {
          mint: b.mint,
          symbol: b.symbol,
          name: b.name,
          decimals: b.decimals,
          icon: b.icon,
          chainId: chainAtFetch,
          isNative: false,
        };
        return {
          token: tokenInfo,
          balance: b.balance,
          uiBalance: b.uiBalance,
        };
      });

      setChainBalances(chainAtFetch, tokenBalances);
    } catch (err) {
      // Only log if this fetch wasn't superseded
      if (fetchIdRef.current === currentFetchId) {
      }
    }
  }, [activeAccount, provider, activeChainId, isLocked, lastBalanceFetch, setChainBalances]);

  // On unlock: force fetch fresh data for current chain
  useEffect(() => {

    if (prevLockedRef.current && !isLocked) {
      // Just unlocked - force fetch
      fetchBalances(true);
    }
    prevLockedRef.current = isLocked;
  }, [isLocked, fetchBalances, activeChainId]);

  // Background polling - only fetch if data is stale
  useEffect(() => {
    if (isLocked) return;

    // Check immediately on mount if we need to fetch
    fetchBalances();

    // Then check periodically
    const interval = setInterval(() => {
      fetchBalances();
    }, BALANCE_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchBalances, isLocked]);

  return {
    balances,
    refetch: useCallback(() => fetchBalances(true), [fetchBalances]),
  };
}
