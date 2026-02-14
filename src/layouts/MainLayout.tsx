"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  SwapHoriz as SwapIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useStore } from "@/store";
import { secureKeyManager } from "@/services/secureKeyManager";
import { Toast } from "@/components/common/Toast";
import { ChainId } from "@/types/chain";
import { CHAIN_CONFIGS } from "@/config/chains";
import { isEvmChain } from "@/config/constants";
import { useExportReminder } from "@/hooks/useExportReminder";

const NAV_ITEMS = [
  { label: "Wallet", icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Swap", icon: <SwapIcon />, path: "/swap" },
  { label: "History", icon: <HistoryIcon />, path: "/history" },
  { label: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const CHAIN_OPTIONS = [
  ChainId.Solana,
  ChainId.Ethereum,
  ChainId.Base,
  ChainId.Arbitrum,
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  useExportReminder();

  const router = useRouter();
  const pathname = usePathname();
  const activeAccount = useStore((s) => s.activeAccount);
  const activeChainId = useStore((s) => s.activeChainId);
  const setActiveChain = useStore((s) => s.setActiveChain);
  const setLocked = useStore((s) => s.setLocked);

  const hasSolana = !!activeAccount?.address;
  const hasEvm = !!activeAccount?.evmAddress;

  // ✅ SECURITY FIX: Lock wallet handler
  const handleLockWallet = () => {
    secureKeyManager.lock();
    setLocked(true);
  };

  // Auto-correct chain selection if current chain is unavailable
  useEffect(() => {
    if (!hasSolana && !isEvmChain(activeChainId)) {
      if (hasEvm) setActiveChain(ChainId.Ethereum);
    } else if (!hasEvm && isEvmChain(activeChainId)) {
      if (hasSolana) setActiveChain(ChainId.Solana);
    }
  }, [hasSolana, hasEvm, activeChainId, setActiveChain]);

  const currentNav = NAV_ITEMS.findIndex((item) =>
    pathname.startsWith(item.path),
  );

  const displayAddress = isEvmChain(activeChainId)
    ? activeAccount?.evmAddress
    : activeAccount?.address;

  const handleChainChange = (chainId: ChainId) => {
    setActiveChain(chainId);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.default",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ minHeight: 56, gap: 1 }}>
          {/* <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            Pepe Bag
          </Typography> */}

          <Stack flex={1} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Select
              value={activeChainId}
              onChange={(e) => handleChainChange(e.target.value as ChainId)}
              size="small"
              sx={{
                minWidth: 120,
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  py: 0.5,
                },
              }}
            >
              {CHAIN_OPTIONS.map((chainId) => {
                const config = CHAIN_CONFIGS[chainId];
                const disabled = isEvmChain(chainId)
                  ? !hasEvm
                  : !hasSolana;
                return (
                  <MenuItem key={chainId} value={chainId} disabled={disabled}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        component="img"
                        src={config.icon}
                        alt={config.name}
                        sx={{ width: 18, height: 18, borderRadius: "50%" }}
                      />
                      {config.name}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>

            <Stack direction="row" alignItems="center" gap={1}>
              {displayAddress && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "monospace" }}
                  component={'p'}
                >
                  {displayAddress.slice(0, 4)}...{displayAddress.slice(-4)}
                </Typography>
              )}

              {/* ✅ SECURITY FIX: Lock wallet button */}
              <Tooltip title="Lock Wallet" arrow>
                <IconButton
                  size="small"
                  onClick={handleLockWallet}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'warning.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <LockIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: "auto", pb: "64px" }}>{children}</Box>

      <BottomNavigation
        value={currentNav}
        onChange={(_, idx) => router.push(NAV_ITEMS[idx].path)}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 480,
          mx: "auto",
        }}
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
