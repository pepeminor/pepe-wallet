import { Box, Button, Paper } from '@mui/material';
import { QrCodeScanner, Close } from '@mui/icons-material';
import { useQrScanner } from '@/hooks/useQrScanner';

const SCANNER_ID = 'qr-reader';

interface QrScannerProps {
  onScan: (result: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const { start, stop, isScanning } = useQrScanner(SCANNER_ID, (text) => {
    // Strip solana: prefix if present
    const address = text.replace(/^solana:/, '');
    onScan(address);
  });

  return (
    <Box>
      {!isScanning ? (
        <Button
          variant="outlined"
          startIcon={<QrCodeScanner />}
          onClick={start}
          size="small"
        >
          Scan QR
        </Button>
      ) : (
        <Paper sx={{ p: 1, position: 'relative' }}>
          <Box
            id={SCANNER_ID}
            sx={{ width: '100%', borderRadius: 1, overflow: 'hidden' }}
          />
          <Button
            variant="text"
            startIcon={<Close />}
            onClick={stop}
            size="small"
            sx={{ mt: 1 }}
          >
            Close Scanner
          </Button>
        </Paper>
      )}
    </Box>
  );
}
