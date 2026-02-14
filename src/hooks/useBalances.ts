import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store';
import { useChainProvider } from './useChain';
import { DEFAULT_TOKENS } from '@/config/tokens';
import { BALANCE_REFRESH_INTERVAL, isEvmChain } from '@/config/constants';
import { TokenBalance } from '@/types/token';

export function useBalances() {
  const activeAccount = useStore((s) => s.activeAccount);
  const activeChainId = useStore((s) => s.activeChainId);
  const setChainBalances = useStore((s) => s.setChainBalances);
  const restoreBalancesFromCache = useStore((s) => s.restoreBalancesFromCache);
  const balances = useStore((s) => s.balances);

  const provider = useChainProvider();
  const prevChainRef = useRef(activeChainId);
  const fetchIdRef = useRef(0);

  // On chain switch: restore cached balances immediately
  useEffect(() => {
    if (prevChainRef.current !== activeChainId) {
      restoreBalancesFromCache(activeChainId);
      prevChainRef.current = activeChainId;
    }
  }, [activeChainId, restoreBalancesFromCache]);

  const fetchBalances = useCallback(async () => {
    if (!activeAccount || !provider) return;

    const address = isEvmChain(activeChainId)
      ? activeAccount.evmAddress
      : activeAccount.address;

    if (!address) return;

    // Track this fetch so we can discard stale results
    const currentFetchId = ++fetchIdRef.current;
    const chainAtFetch = activeChainId;

    try {
      const chainBalances = await provider.getTokenBalances(address);

      // Discard if chain changed during fetch
      if (fetchIdRef.current !== currentFetchId) return;

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
        console.error('Failed to fetch balances:', err);
      }
    }
  }, [activeAccount, provider, activeChainId, setChainBalances]);

  // Debounce fetch on chain switch, then poll at interval
  useEffect(() => {
    // Small delay to let chain switch settle and avoid empty batch RPCs
    const debounce = setTimeout(() => {
      fetchBalances();
    }, 150);

    const interval = setInterval(fetchBalances, BALANCE_REFRESH_INTERVAL);

    return () => {
      clearTimeout(debounce);
      clearInterval(interval);
    };
  }, [fetchBalances]);

  return { balances, refetch: fetchBalances };
}
