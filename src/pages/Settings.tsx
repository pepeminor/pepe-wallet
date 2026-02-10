import { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  Alert,
} from '@mui/material';
import {
  Language,
  Tune,
  DeleteForever,
  Info,
  VpnKey,
  Visibility,
  VisibilityOff,
  ContentCopy,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { NetworkType } from '@/types/chain';
import { clearKeystore, loadKeystore } from '@/services/keystore';
import { copyToClipboard } from '@/utils/clipboard';
import { AddressDisplay } from '@/components/common/AddressDisplay';

export function SettingsPage() {
  const navigate = useNavigate();
  const network = useStore((s) => s.network);
  const setNetwork = useStore((s) => s.setNetwork);
  const activeAccount = useStore((s) => s.activeAccount);
  const slippageBps = useStore((s) => s.slippageBps);
  const setSlippage = useStore((s) => s.setSlippage);
  const reset = useStore((s) => s.reset);
  const addToast = useStore((s) => s.addToast);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportedKey, setExportedKey] = useState('');
  const [exportError, setExportError] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [slippageInput, setSlippageInput] = useState(
    (slippageBps / 100).toString()
  );

  const handleNetworkChange = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
    addToast({ type: 'info', message: `Switched to ${newNetwork}` });
  };

  const handleSlippageChange = () => {
    const val = parseFloat(slippageInput);
    if (!isNaN(val) && val > 0 && val <= 50) {
      setSlippage(Math.round(val * 100));
      addToast({ type: 'success', message: `Slippage set to ${val}%` });
    }
  };

  const handleExportKey = async () => {
    if (!exportPassword.trim()) return;
    setExportLoading(true);
    setExportError('');
    try {
      const key = await loadKeystore(exportPassword);
      setExportedKey(key);
    } catch {
      setExportError('Incorrect password. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleCloseExportDialog = () => {
    setExportDialogOpen(false);
    setExportPassword('');
    setExportedKey('');
    setExportError('');
    setShowKey(false);
  };

  const handleCopyKey = async () => {
    const ok = await copyToClipboard(exportedKey);
    if (ok) addToast({ type: 'success', message: 'Private key copied' });
  };

  const handleResetWallet = () => {
    clearKeystore();
    reset();
    setResetDialogOpen(false);
    navigate('/onboarding', { replace: true });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Settings
      </Typography>

      {activeAccount && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Active Wallet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {activeAccount.label} ({activeAccount.mode})
          </Typography>
          <AddressDisplay address={activeAccount.address} chars={10} />
        </Box>
      )}

      <List>
        <ListItem>
          <ListItemIcon>
            <Language />
          </ListItemIcon>
          <ListItemText primary="Network" secondary={network} />
          <Select
            value={network}
            onChange={(e) => handleNetworkChange(e.target.value as NetworkType)}
            size="small"
            sx={{ minWidth: 130 }}
          >
            <MenuItem value={NetworkType.Devnet}>Devnet</MenuItem>
            <MenuItem value={NetworkType.Mainnet}>Mainnet</MenuItem>
          </Select>
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemIcon>
            <Tune />
          </ListItemIcon>
          <ListItemText
            primary="Default Slippage"
            secondary={`${(slippageBps / 100).toFixed(1)}%`}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              value={slippageInput}
              onChange={(e) => setSlippageInput(e.target.value)}
              onBlur={handleSlippageChange}
              size="small"
              sx={{ width: 70 }}
              InputProps={{ endAdornment: '%' }}
            />
          </Box>
        </ListItem>

        <Divider />

        <ListItem
          onClick={() => setExportDialogOpen(true)}
          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <ListItemIcon>
            <VpnKey />
          </ListItemIcon>
          <ListItemText
            primary="Export Private Key"
            secondary="View and copy your private key"
          />
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemIcon>
            <Info />
          </ListItemIcon>
          <ListItemText
            primary="Version"
            secondary="0.1.0 - Devnet"
          />
        </ListItem>

        <Divider />

        <ListItem
          onClick={() => setResetDialogOpen(true)}
          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(248,81,73,0.08)' } }}
        >
          <ListItemIcon>
            <DeleteForever color="error" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography color="error">Reset Wallet</Typography>}
            secondary="Remove all data and start over"
          />
        </ListItem>
      </List>

      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Wallet?</DialogTitle>
        <DialogContent>
          <Typography>
            This will delete your encrypted keystore and all local data. Make
            sure you have backed up your recovery phrase or private key.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetWallet} color="error" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={exportDialogOpen} onClose={handleCloseExportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Export Private Key</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {!exportedKey ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Enter your password to reveal your private key.
              </Typography>
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExportKey()}
                error={!!exportError}
                helperText={exportError}
                autoFocus
              />
            </>
          ) : (
            <>
              <Alert severity="warning" sx={{ mt: 1 }}>
                Never share your private key. Anyone with this key can access your funds.
              </Alert>
              <TextField
                fullWidth
                multiline={showKey}
                rows={showKey ? 3 : 1}
                value={showKey ? exportedKey : '••••••••••••••••••••••••••••'}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small" onClick={() => setShowKey(!showKey)} sx={{ minWidth: 0, p: 0.5 }}>
                        {showKey ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </Button>
                      <Button size="small" onClick={handleCopyKey} sx={{ minWidth: 0, p: 0.5 }}>
                        <ContentCopy fontSize="small" />
                      </Button>
                    </Box>
                  ),
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExportDialog}>Close</Button>
          {!exportedKey && (
            <Button
              onClick={handleExportKey}
              variant="contained"
              disabled={exportLoading || !exportPassword.trim()}
            >
              {exportLoading ? 'Decrypting...' : 'Reveal Key'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
