import { useState } from 'react';
import { useStore } from '@/store';
import { useChainProvider } from './useChain';
import { NATIVE_SOL_MINT } from '@/config/constants';
import bs58 from 'bs58';

export function useSendTransaction() {
  const [sending, setSending] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeAccount = useStore((s) => s.activeAccount);
  const secretKeyBase58 = useStore((s) => s.secretKeyBase58);
  const addToast = useStore((s) => s.addToast);
  const addPending = useStore((s) => s.addPending);

  const provider = useChainProvider();

  const send = async (params: {
    to: string;
    amount: number;
    mint: string;
    decimals: number;
  }) => {
    if (!activeAccount || !provider) {
      setError('Wallet not connected');
      return;
    }

    setSending(true);
    setError(null);
    setTxSignature(null);

    try {
      const secretKey = secretKeyBase58
        ? bs58.decode(secretKeyBase58)
        : undefined;

      let sig: string;
      if (params.mint === NATIVE_SOL_MINT) {
        sig = await provider.sendNativeToken({
          from: activeAccount.address,
          to: params.to,
          amount: params.amount,
          secretKey,
        });
      } else {
        sig = await provider.sendToken({
          from: activeAccount.address,
          to: params.to,
          mint: params.mint,
          amount: params.amount,
          decimals: params.decimals,
          secretKey,
        });
      }

      setTxSignature(sig);
      addPending(sig);
      addToast({ type: 'success', message: 'Transaction confirmed!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      setError(msg);
      addToast({ type: 'error', message: msg });
    } finally {
      setSending(false);
    }
  };

  return { send, sending, txSignature, error };
}
