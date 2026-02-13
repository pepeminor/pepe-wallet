'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Typography, Box, Alert } from '@mui/material';
import { SwapCard } from '@/components/swap/SwapCard';
import { useStore } from '@/store';
import { DEFAULT_TOKENS } from '@/config/tokens';
import { ChainId } from '@/types/chain';
import { isEvmChain } from '@/config/constants';

export function SwapPage() {
  const params = useParams();
  const inputMint = params?.inputMint as string | undefined;
  const outputMint = params?.outputMint as string | undefined;
  const activeChainId = useStore((s) => s.activeChainId);
  const setInputToken = useStore((s) => s.setInputToken);
  const setOutputToken = useStore((s) => s.setOutputToken);

  useEffect(() => {
    if (isEvmChain(activeChainId)) return;

    const tokens = DEFAULT_TOKENS[ChainId.Solana];
    if (inputMint) {
      const token = tokens.find((t) => t.mint === inputMint);
      if (token) setInputToken(token);
    } else {
      setInputToken(tokens[0]); // SOL
    }
    if (outputMint) {
      const token = tokens.find((t) => t.mint === outputMint);
      if (token) setOutputToken(token);
    } else {
      setOutputToken(tokens[1]); // USDC
    }
  }, [inputMint, outputMint, setInputToken, setOutputToken, activeChainId]);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, px: 2, pt: 2 }}>
        Swap
      </Typography>
      {isEvmChain(activeChainId) ? (
        <Box sx={{ p: 2 }}>
          <Alert severity="info">
            Swap is not available on EVM chains. Switch to Solana to use the swap feature.
          </Alert>
        </Box>
      ) : (
        <SwapCard />
      )}
    </Box>
  );
}
