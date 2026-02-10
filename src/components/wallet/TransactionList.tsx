import { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  SwapHoriz,
  HelpOutline,
} from '@mui/icons-material';
import { useStore } from '@/store';
import { useChainProvider } from '@/hooks/useChain';
import { TransactionRecord } from '@/types/chain';
import { formatTimestamp, formatBalance } from '@/utils/format';

const TYPE_ICONS = {
  send: <ArrowUpward sx={{ color: 'error.main' }} />,
  receive: <ArrowDownward sx={{ color: 'success.main' }} />,
  swap: <SwapHoriz sx={{ color: 'info.main' }} />,
  unknown: <HelpOutline sx={{ color: 'text.secondary' }} />,
};

export function TransactionList() {
  const activeAccount = useStore((s) => s.activeAccount);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const provider = useChainProvider();

  useEffect(() => {
    if (!activeAccount?.address || !provider) return;

    setLoading(true);
    provider
      .getTransactionHistory(activeAccount.address, 10)
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeAccount?.address, provider]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Loading transactions...
        </Typography>
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No recent transactions
        </Typography>
      </Box>
    );
  }

  return (
    <List dense>
      {transactions.map((tx) => (
        <ListItem key={tx.signature} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            {TYPE_ICONS[tx.type]}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                  {tx.type}
                </Typography>
                <Chip
                  label={tx.status}
                  size="small"
                  color={tx.status === 'confirmed' ? 'success' : tx.status === 'failed' ? 'error' : 'default'}
                  sx={{ height: 20, fontSize: '10px' }}
                />
              </Box>
            }
            secondary={formatTimestamp(tx.timestamp)}
          />
          {tx.amount !== undefined && (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {tx.type === 'send' ? '-' : '+'}
              {formatBalance(tx.amount)} {tx.token ?? ''}
            </Typography>
          )}
        </ListItem>
      ))}
    </List>
  );
}
