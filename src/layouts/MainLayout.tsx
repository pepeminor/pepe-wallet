import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  SwapHoriz as SwapIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useStore } from '@/store';
import { Toast } from '@/components/common/Toast';

const NAV_ITEMS = [
  { label: 'Wallet', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Swap', icon: <SwapIcon />, path: '/swap' },
  { label: 'History', icon: <HistoryIcon />, path: '/history' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeAccount = useStore((s) => s.activeAccount);

  const currentNav = NAV_ITEMS.findIndex((item) =>
    location.pathname.startsWith(item.path)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ minHeight: 56 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            Solana Wallet
          </Typography>
          {activeAccount && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {activeAccount.address.slice(0, 4)}...{activeAccount.address.slice(-4)}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'auto', pb: '64px' }}>
        <Outlet />
      </Box>

      <BottomNavigation
        value={currentNav}
        onChange={(_, idx) => navigate(NAV_ITEMS[idx].path)}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 480, mx: 'auto' }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>

      <Toast />
    </Box>
  );
}
