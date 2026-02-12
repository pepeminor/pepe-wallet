'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Typography, Box } from '@mui/material';
import { SwapCard } from '@/components/swap/SwapCard';
import { useStore } from '@/store';
import { DEFAULT_TOKENS } from '@/config/tokens';
import { ChainId } from '@/types/chain';

export function SwapPage() {
  const params = useParams();
  const inputMint = params?.inputMint as string | undefined;
  const outputMint = params?.outputMint as string | undefined;
  const setInputToken = useStore((s) => s.setInputToken);
  const setOutputToken = useStore((s) => s.setOutputToken);

  useEffect(() => {
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
  }, [inputMint, outputMint, setInputToken, setOutputToken]);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, px: 2, pt: 2 }}>
        Swap
      </Typography>
      <SwapCard />
    </Box>
  );
}
