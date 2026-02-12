import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  SwapHoriz,
  HelpOutline,
  OpenInNew,
} from '@mui/icons-material';
import { useStore } from '@/store';
import { useChainProvider } from '@/hooks/useChain';
import { TransactionRecord } from '@/types/chain';
import { formatTimestamp, formatBalance, formatAddress } from '@/utils/format';
import { NetworkType } from '@/types/chain';
import { Spinner } from '@/components/common/Spinner';

const TYPE_ICONS = {
  send: <ArrowUpward sx={{ color: 'error.main' }} />,
  receive: <ArrowDownward sx={{ color: 'success.main' }} />,
  swap: <SwapHoriz sx={{ color: 'info.main' }} />,
  unknown: <HelpOutline sx={{ color: 'text.secondary' }} />,
};

export function HistoryPage() {
  const activeAccount = useStore((s) => s.activeAccount);
  const network = useStore((s) => s.network);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const provider = useChainProvider();

  useEffect(() => {
    if (!activeAccount?.address || !provider) return;

    setLoading(true);
    provider
      .getTransactionHistory(activeAccount.address, 30)
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeAccount?.address, provider]);

  const explorerBase =
    network === NetworkType.Devnet
      ? 'https://explorer.solana.com/tx/'
      : 'https://explorer.solana.com/tx/';
  const clusterParam = network === NetworkType.Devnet ? '?cluster=devnet' : '';

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Transaction History
      </Typography>

      {loading ? (
        <Spinner message="Loading transactions..." />
      ) : transactions.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No transactions found
        </Typography>
      ) : (
        <List>
          {transactions.map((tx) => (
            <ListItem
              key={tx.signature}
              sx={{
                borderRadius: 2,
                mb: 1,
                border: 1,
                borderColor: 'divider',
              }}
              secondaryAction={
                <Tooltip title="View on Explorer">
                  <IconButton
                    edge="end"
                    size="small"
                    component="a"
                    href={`${explorerBase}${tx.signature}${clusterParam}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <OpenInNew fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {TYPE_ICONS[tx.type]}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {tx.type}
                    </Typography>
                    <Chip
                      label={tx.status}
                      size="small"
                      color={
                        tx.status === 'confirmed'
                          ? 'success'
                          : tx.status === 'failed'
                          ? 'error'
                          : 'default'
                      }
                      sx={{ height: 20, fontSize: '10px' }}
                    />
                    {tx.amount !== undefined && (
                      <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 500 }}>
                        {tx.type === 'send' ? '-' : '+'}
                        {formatBalance(tx.amount)} {tx.token ?? ''}
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(tx.timestamp)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, fontFamily: 'monospace' }}
                    >
                      {formatAddress(tx.signature, 8)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
