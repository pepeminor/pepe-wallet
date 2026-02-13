import { useEffect, useCallback } from 'react';
import { useStore } from '@/store';
import { useChainProvider } from './useChain';
import { DEFAULT_TOKENS } from '@/config/tokens';
import { BALANCE_REFRESH_INTERVAL, isEvmChain } from '@/config/constants';
import { TokenBalance } from '@/types/token';

export function useBalances() {
  const activeAccount = useStore((s) => s.activeAccount);
  const activeChainId = useStore((s) => s.activeChainId);
  const setBalances = useStore((s) => s.setBalances);
  const balances = useStore((s) => s.balances);

  const provider = useChainProvider();

  const fetchBalances = useCallback(async () => {
    if (!activeAccount || !provider) return;

    // Use the correct address for the active chain
    const address = isEvmChain(activeChainId)
      ? activeAccount.evmAddress
      : activeAccount.address;

    if (!address) return;

    try {
      const chainBalances = await provider.getTokenBalances(address);
      const defaultTokens = DEFAULT_TOKENS[activeChainId] ?? [];

      const tokenBalances: TokenBalance[] = chainBalances.map((b) => {
        const tokenInfo = defaultTokens.find((t) => t.mint === b.mint) ?? {
          mint: b.mint,
          symbol: b.symbol,
          name: b.name,
          decimals: b.decimals,
          icon: b.icon,
          chainId: activeChainId,
          isNative: false,
        };
        return {
          token: tokenInfo,
          balance: b.balance,
          uiBalance: b.uiBalance,
        };
      });

      setBalances(tokenBalances);
    } catch (err) {
      console.error('Failed to fetch balances:', err);
    }
  }, [activeAccount, provider, activeChainId, setBalances]);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, BALANCE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  return { balances, refetch: fetchBalances };
}
