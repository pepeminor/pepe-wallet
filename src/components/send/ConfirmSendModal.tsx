'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { Close, Send as SendIcon } from '@mui/icons-material';
import { TokenIcon } from '@/components/common/TokenIcon';
import { formatBalance, formatUsd, calcUsdValue } from '@/utils/format';
import { TokenBalance } from '@/types/token';

interface ConfirmSendModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  token: TokenBalance | null;
  recipient: string;
  amount: number;
  priceUsd: number;
  sending?: boolean;
}

export function ConfirmSendModal({
  open,
  onClose,
  onConfirm,
  token,
  recipient,
  amount,
  priceUsd,
  sending = false,
}: ConfirmSendModalProps) {
  if (!token) return null;

  const usdValue = calcUsdValue(amount, priceUsd);

  // Format address for display (show first 6 and last 4 chars)
  const formatAddress = (addr: string) => {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Dialog
      open={open}
      onClose={sending ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          mx: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Confirm Send
          </Typography>
          {!sending && (
            <IconButton onClick={onClose} size="small" edge="end">
              <Close />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          {/* Amount Section */}
          <Box
            sx={{
              textAlign: 'center',
              px: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1 }}>
              <TokenIcon icon={token.token.icon} symbol={token.token.symbol} size={64} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {formatBalance(amount)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {token.token.symbol}
                </Typography>
              </Box>
            </Box>

            {priceUsd > 0 && (
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                ≈ {formatUsd(usdValue)}
              </Typography>
            )}
          </Box>

          {/* Details Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* From */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                From
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Your Wallet
              </Typography>
            </Box>

            {/* To */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                To
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {recipient}
              </Typography>
            </Box>

            {/* Network */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Network
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                {token.token.chainId}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          disabled={sending}
          sx={{ borderRadius: 2, py: 1.5 }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={onConfirm}
          disabled={sending}
          startIcon={<SendIcon />}
          sx={{
            borderRadius: 2,
            py: 1.5,
            background: '#3CB043',
            '&:hover': { background: '#35a03b' },
          }}
        >
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
