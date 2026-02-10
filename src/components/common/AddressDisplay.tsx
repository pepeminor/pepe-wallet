import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';
import { useState } from 'react';
import { formatAddress } from '@/utils/format';
import { copyToClipboard } from '@/utils/clipboard';

interface AddressDisplayProps {
  address: string;
  chars?: number;
  showCopy?: boolean;
  fullWidth?: boolean;
}

export function AddressDisplay({
  address,
  chars = 6,
  showCopy = true,
  fullWidth = false,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'monospace',
          color: 'text.secondary',
          ...(fullWidth ? {} : {}),
        }}
      >
        {fullWidth ? address : formatAddress(address, chars)}
      </Typography>
      {showCopy && (
        <Tooltip title={copied ? 'Copied!' : 'Copy'}>
          <IconButton size="small" onClick={handleCopy}>
            {copied ? (
              <Check sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <ContentCopy sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
