import { Box, Button } from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  SwapHoriz,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export function ActionButtons() {
  const navigate = useNavigate();

  const actions = [
    { label: 'Send', icon: <ArrowUpward />, path: '/send' },
    { label: 'Receive', icon: <ArrowDownward />, path: '/receive' },
    { label: 'Swap', icon: <SwapHoriz />, path: '/swap' },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', px: 2, mb: 3 }}>
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outlined"
          onClick={() => navigate(action.path)}
          sx={{
            flex: 1,
            flexDirection: 'column',
            gap: 0.5,
            py: 1.5,
            borderColor: 'divider',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(123, 97, 255, 0.08)' },
          }}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </Box>
  );
}
