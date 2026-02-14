import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import { useStore } from '@/store';
import { TokenIcon } from '@/components/common/TokenIcon';
import { TokenBalance } from '@/types/token';
import { formatBalance } from '@/utils/format';

interface TokenSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (token: TokenBalance) => void;
}

export function TokenSelector({ open, onClose, onSelect }: TokenSelectorProps) {
  const balances = useStore((s) => s.balances);
  // ✅ SECURITY FIX: Removed console.log to prevent data leakage in production

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Select Token</DialogTitle>
      <List sx={{ pb: 2 }}>
        {balances.map((b) => (
          <ListItem
            key={b.token.mint}
            onClick={() => {
              onSelect(b);
              onClose();
            }}
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } }}
          >
            <ListItemAvatar>
              <TokenIcon icon={b.token.icon} symbol={b.token.symbol} />
            </ListItemAvatar>
            <ListItemText
              primary={b.token.symbol}
              secondary={b.token.name}
            />
            <Typography variant="body2" color="text.secondary">
              {formatBalance(b.uiBalance)}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}
