import { useState } from 'react';
import { useStore } from '@/store';
import { useChainProvider } from './useChain';
import { getNativeMint, isEvmChain } from '@/config/constants';
import { secureKeyManager } from '@/services/secureKeyManager';
import { loadKeystore } from '@/services/keystore';

export function useSendTransaction() {
  const [sending, setSending] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeAccount = useStore((s) => s.activeAccount);
  const activeChainId = useStore((s) => s.activeChainId);
  const addToast = useStore((s) => s.addToast);
  const addPending = useStore((s) => s.addPending);

  const provider = useChainProvider();

  const send = async (params: {
    to: string;
    amount: number;
    mint: string;
    decimals: number;
    password: string;
  }) => {
    if (!activeAccount || !provider) {
      setError('Wallet not connected');
      return;
    }

    setSending(true);
    setError(null);
    setTxSignature(null);

    try {
      // ✅ SECURITY: Verify password before proceeding with transaction
      // This is a defense-in-depth measure (password already verified in dialog)
      try {
        await loadKeystore(params.password);
      } catch {
        throw new Error('Password verification failed');
      }
      const isEvm = isEvmChain(activeChainId);
      const fromAddress = isEvm
        ? activeAccount.evmAddress
        : activeAccount.address;

      if (!fromAddress) {
        throw new Error('No address available for this chain');
      }

      // Get the correct secret key from secure key manager
      let secretKey: Uint8Array | undefined;
      if (isEvm && secureKeyManager.hasEvmKey()) {
        secretKey = secureKeyManager.getEvmPrivateKey();
      } else if (!isEvm && secureKeyManager.hasSolanaKey()) {
        secretKey = secureKeyManager.getSolanaSecretKey();
      }

      const nativeMint = getNativeMint(activeChainId);

      let sig: string;
      if (params.mint === nativeMint) {
        sig = await provider.sendNativeToken({
          from: fromAddress,
          to: params.to,
          amount: params.amount,
          secretKey,
        });
      } else {
        sig = await provider.sendToken({
          from: fromAddress,
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
