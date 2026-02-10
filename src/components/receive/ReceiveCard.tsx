import { Box, Typography, Paper, Button } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useStore } from '@/store';
import { copyToClipboard } from '@/utils/clipboard';
import { AddressDisplay } from '@/components/common/AddressDisplay';

export function ReceiveCard() {
  const activeAccount = useStore((s) => s.activeAccount);
  const [copied, setCopied] = useState(false);

  if (!activeAccount) return null;

  const address = activeAccount.address;

  const handleCopy = async () => {
    await copyToClipboard(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        p: 3,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Receive
      </Typography>

      <Paper
        sx={{
          p: 3,
          bgcolor: '#fff',
          borderRadius: 3,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <QRCodeSVG
          value={`solana:${address}`}
          size={220}
          level="M"
          includeMargin={false}
        />
      </Paper>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Scan QR code or copy address below to receive tokens
      </Typography>

      <AddressDisplay address={address} chars={8} />

      <Button
        fullWidth
        variant="outlined"
        startIcon={copied ? <Check /> : <ContentCopy />}
        onClick={handleCopy}
        color={copied ? 'success' : 'primary'}
      >
        {copied ? 'Copied!' : 'Copy Address'}
      </Button>
    </Box>
  );
}
