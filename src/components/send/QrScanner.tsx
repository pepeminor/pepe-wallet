'use client';

import { Box, Button, IconButton, Typography } from '@mui/material';
import { QrCodeScanner, Close } from '@mui/icons-material';
import { useQrScanner } from '@/hooks/useQrScanner';
import { useEffect } from 'react';

const SCANNER_ID = 'qr-reader';

interface QrScannerProps {
  onScan: (result: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const { open, stop, startScanner, isOpen } = useQrScanner(SCANNER_ID, (text) => {
    const address = text.replace(/^solana:/, '');
    onScan(address);
  });

  // Start scanner after overlay mounts
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => startScanner(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, startScanner]);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<QrCodeScanner />}
        onClick={open}
        size="small"
      >
        Scan QR
      </Button>

      {isOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={stop}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <Close />
          </IconButton>

          {/* Title */}
          <Typography variant="subtitle1" fontWeight={600} color="white" sx={{ mb: 2 }}>
            Scan QR Code
          </Typography>

          {/* Camera view — square, large */}
          <Box
            id={SCANNER_ID}
            sx={{
              width: 'calc(100vw - 48px)',
              maxWidth: 360,
              aspectRatio: '1',
              borderRadius: 3,
              overflow: 'hidden',
              '& video': {
                borderRadius: 3,
                objectFit: 'cover',
                width: '100% !important',
                height: '100% !important',
              },
              '& img[alt="Info icon"]': { display: 'none' },
            }}
          />

          {/* Warning */}
          <Typography
            variant="caption"
            sx={{ mt: 2, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 300 }}
          >
            Only scan QR codes from sources you trust. Malicious codes may lead to loss of funds.
          </Typography>
        </Box>
      )}
    </>
  );
}
