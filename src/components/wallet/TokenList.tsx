import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { usePrices } from '@/hooks/usePrices';
import { TokenIcon } from '@/components/common/TokenIcon';
import { formatBalance, formatUsd } from '@/utils/format';

export function TokenList() {
  const balances = useStore((s) => s.balances);
  const prices = usePrices();
  const navigate = useNavigate();

  if (balances.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No tokens found</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ px: 1 }}>
      {balances.map((b) => {
        const price = prices[b.token.mint]?.priceUsd ?? 0;
        const usdValue = b.uiBalance * price;

        return (
          <ListItem
            key={b.token.mint}
            onClick={() => navigate(`/send/${b.token.mint}`)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
            }}
          >
            <ListItemAvatar>
              <TokenIcon icon={b.token.icon} symbol={b.token.symbol} />
            </ListItemAvatar>
            <ListItemText
              primary={b.token.symbol}
              secondary={b.token.name}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatBalance(b.uiBalance)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatUsd(usdValue)}
              </Typography>
            </Box>
          </ListItem>
        );
      })}
    </List>
  );
}
