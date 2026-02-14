import { useState } from "react";
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
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Language,
  Tune,
  DeleteForever,
  Info,
  VpnKey,
  Visibility,
  VisibilityOff,
  ContentCopy,
  AddCircle,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { NetworkType } from "@/types/chain";
import {
  clearKeystore,
  loadKeystore,
  isMnemonic,
  hasKeystore,
  hasEvmKeystore,
  loadEvmKeystore,
  saveKeystore,
  saveEvmKeystore,
} from "@/services/keystore";
import {
  restoreFromMnemonic,
  importFromPrivateKey,
} from "@/services/walletGenerator";
import { copyToClipboard } from "@/utils/clipboard";
import { AddressDisplay } from "@/components/common/AddressDisplay";
import { isEvmChain, MIN_SLIPPAGE_BPS, MAX_SLIPPAGE_BPS } from "@/config/constants";
import { secureKeyManager } from "@/services/secureKeyManager";
import { ethers } from "ethers";

interface ExportedKeys {
  mnemonic: string | null;
  solanaKey: string | null;
  evmKey: string | null;
}

export function SettingsPage() {
  const router = useRouter();
  const network = useStore((s) => s.network);
  const setNetwork = useStore((s) => s.setNetwork);
  const activeAccount = useStore((s) => s.activeAccount);
  const activeChainId = useStore((s) => s.activeChainId);
  const slippageBps = useStore((s) => s.slippageBps);
  const setSlippage = useStore((s) => s.setSlippage);
  const reset = useStore((s) => s.reset);
  const addToast = useStore((s) => s.addToast);
  const setHasExportedKeys = useStore((s) => s.setHasExportedKeys);
  const setLocked = useStore((s) => s.setLocked);
  const updateActiveAccount = useStore((s) => s.updateActiveAccount);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [exportedKeys, setExportedKeys] = useState<ExportedKeys | null>(null);
  const [exportError, setExportError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showSolanaKey, setShowSolanaKey] = useState(false);
  const [showEvmKey, setShowEvmKey] = useState(false);
  const [slippageInput, setSlippageInput] = useState(
    (slippageBps / 100).toString(),
  );
  const [exportConfirmed, setExportConfirmed] = useState(false);

  // Import missing chain dialog
  const [importChainDialog, setImportChainDialog] = useState<
    "solana" | "evm" | null
  >(null);
  const [importPassword, setImportPassword] = useState("");
  const [importKey, setImportKey] = useState("");
  const [importError, setImportError] = useState("");
  const [importLoading, setImportLoading] = useState(false);

  const isEvm = isEvmChain(activeChainId);
  const missingSolana = activeAccount && !activeAccount.address;
  const missingEvm = activeAccount && !activeAccount.evmAddress;

  const handleNetworkChange = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
    addToast({ type: "info", message: `Switched to ${newNetwork}` });
  };

  const handleSlippageChange = () => {
    const val = parseFloat(slippageInput);
    const minPercent = MIN_SLIPPAGE_BPS / 100;
    const maxPercent = MAX_SLIPPAGE_BPS / 100;

    if (isNaN(val)) {
      addToast({ type: "error", message: "Invalid slippage value" });
      return;
    }

    // ✅ SECURITY FIX: Enforce slippage limits
    if (val < minPercent || val > maxPercent) {
      addToast({
        type: "error",
        message: `Slippage must be between ${minPercent}% and ${maxPercent}%`
      });
      return;
    }

    // Warn on high slippage
    if (val > 1) {
      addToast({
        type: "warning",
        message: `High slippage (${val}%) increases risk of value loss from sandwich attacks`
      });
    }

    setSlippage(Math.round(val * 100));
    addToast({ type: "success", message: `Slippage set to ${val}%` });
  };

  const handleExportKey = async () => {
    if (!exportPassword.trim()) return;
    setExportLoading(true);
    setExportError("");
    try {
      let solanaKey: string | null = null;
      let evmKey: string | null = null;
      let mnemonic: string | null = null;

      // Load main keystore
      if (hasKeystore()) {
        const decrypted = await loadKeystore(exportPassword);
        if (isMnemonic(decrypted)) {
          mnemonic = decrypted;
          const wallet = restoreFromMnemonic(decrypted);
          solanaKey = wallet.secretKeyBase58;
          evmKey = wallet.evmPrivateKey;
        } else {
          solanaKey = decrypted;
        }
      }

      // Load separate EVM keystore if exists
      if (hasEvmKeystore()) {
        try {
          evmKey = await loadEvmKeystore(exportPassword);
        } catch {
          // May fail if different password — skip
        }
      }

      setExportedKeys({ mnemonic, solanaKey, evmKey });
      setHasExportedKeys(true);
    } catch {
      setExportError("Incorrect password. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleCloseExportDialog = () => {
    setExportDialogOpen(false);
    setExportPassword("");
    setExportedKeys(null);
    setExportError("");
    setShowMnemonic(false);
    setShowSolanaKey(false);
    setShowEvmKey(false);
    setExportConfirmed(false); // Reset confirmation
  };

  const handleCopyAll = async () => {
    if (!exportedKeys) return;
    const parts: string[] = [];
    if (exportedKeys.mnemonic) {
      parts.push("----------------");
      parts.push("Recovery Phrase:");
      parts.push(exportedKeys.mnemonic);
    }
    if (exportedKeys.solanaKey) {
      parts.push("----------------");
      parts.push("Solana Private Key:");
      parts.push(exportedKeys.solanaKey);
    }
    if (exportedKeys.evmKey) {
      parts.push("----------------");
      parts.push("EVM Private Key (Ethereum/Base/Arbitrum):");
      parts.push(exportedKeys.evmKey);
    }
    const ok = await copyToClipboard(parts.join("\n"));
    if (ok)
      addToast({ type: "success", message: "All keys copied to clipboard" });
  };

  const handleResetWallet = () => {
    clearKeystore();
    reset();
    setResetDialogOpen(false);
    router.replace("/onboarding");
  };

  const handleImportChainKey = async () => {
    if (!importPassword.trim() || !importKey.trim()) return;
    setImportLoading(true);
    setImportError("");

    try {
      if (importChainDialog === "solana") {
        const { publicKey, secretKeyBase58 } = importFromPrivateKey(
          importKey.trim(),
        );
        await saveKeystore(secretKeyBase58, importPassword);

        // ✅ SECURITY FIX: Use secure key manager
        secureKeyManager.unlockSolana(secretKeyBase58);
        secureKeyManager.setLockCallback(() => {
          setLocked(true);
        });

        updateActiveAccount({ address: publicKey });
        addToast({ type: "success", message: "Solana key imported" });
      } else if (importChainDialog === "evm") {
        const trimmedKey = importKey.trim();
        const wallet = new ethers.Wallet(trimmedKey);
        await saveEvmKeystore(trimmedKey, importPassword);

        // ✅ SECURITY FIX: Use secure key manager
        secureKeyManager.unlockEvm(trimmedKey);
        secureKeyManager.setLockCallback(() => {
          setLocked(true);
        });

        updateActiveAccount({ evmAddress: wallet.address });
        addToast({ type: "success", message: "EVM key imported" });
      }
      setImportChainDialog(null);
      setImportPassword("");
      setImportKey("");
    } catch {
      setImportError(
        importChainDialog === "solana"
          ? "Invalid Solana private key (Base58)."
          : "Invalid EVM private key (0x hex).",
      );
    } finally {
      setImportLoading(false);
    }
  };

  const handleCloseImportDialog = () => {
    setImportChainDialog(null);
    setImportPassword("");
    setImportKey("");
    setImportError("");
  };

  const renderKeySection = (
    label: string,
    value: string,
    show: boolean,
    setShow: (v: boolean) => void,
  ) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          p: 1.5,
          borderRadius: 1,
          bgcolor: "action.hover",
          fontFamily: "monospace",
          fontSize: "0.85rem",
          wordBreak: "break-all",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          {show ? value : "••••••••••••••••••"}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          <IconButton size="small" onClick={() => setShow(!show)}>
            {show ? (
              <VisibilityOff fontSize="small" />
            ) : (
              <Visibility fontSize="small" />
            )}
          </IconButton>
          <IconButton
            size="small"
            onClick={async () => {
              const ok = await copyToClipboard(value);
              if (ok) addToast({ type: "success", message: `${label} copied` });
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

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
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Wallet Addresses
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {activeAccount.label} ({activeAccount.mode})
          </Typography>

          {activeAccount.address ? (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Solana
              </Typography>
              <AddressDisplay address={activeAccount.address} chars={10} />
            </Box>
          ) : (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Solana — not imported
              </Typography>
            </Box>
          )}

          {activeAccount.evmAddress ? (
            <Box>
              <Typography variant="caption" color="text.secondary">
                EVM
              </Typography>
              <AddressDisplay address={activeAccount.evmAddress} chars={10} />
            </Box>
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">
                EVM — not imported
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <List>
        {/* Import missing chain keys */}
        {(missingSolana || missingEvm) && (
          <>
            {missingSolana && (
              <ListItem
                onClick={() => setImportChainDialog("solana")}
                sx={{
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemIcon>
                  <AddCircle color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Import Solana Private Key"
                  secondary="Add Solana support to your wallet"
                />
              </ListItem>
            )}
            {missingEvm && (
              <ListItem
                onClick={() => setImportChainDialog("evm")}
                sx={{
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemIcon>
                  <AddCircle color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Import EVM Private Key"
                  secondary="Add Ethereum/Base/Arbitrum support to your wallet"
                />
              </ListItem>
            )}
            <Divider />
          </>
        )}

        {!isEvm && (
          <>
            <ListItem>
              <ListItemIcon>
                <Language />
              </ListItemIcon>
              <ListItemText primary="Network" secondary={network} />
              <Select
                value={network}
                onChange={(e) =>
                  handleNetworkChange(e.target.value as NetworkType)
                }
                size="small"
                sx={{ minWidth: 130 }}
              >
                <MenuItem value={NetworkType.Devnet}>Devnet</MenuItem>
                <MenuItem value={NetworkType.Mainnet}>Mainnet</MenuItem>
              </Select>
            </ListItem>
            <Divider />
          </>
        )}

        <ListItem>
          <ListItemIcon>
            <Tune />
          </ListItemIcon>
          <ListItemText
            primary="Default Slippage"
            secondary={`${(slippageBps / 100).toFixed(1)}%`}
          />
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              value={slippageInput}
              onChange={(e) => setSlippageInput(e.target.value)}
              onBlur={handleSlippageChange}
              size="small"
              sx={{ width: 70 }}
              InputProps={{ endAdornment: "%" }}
            />
          </Box>
        </ListItem>

        <Divider />

        <ListItem
          onClick={() => setExportDialogOpen(true)}
          sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
        >
          <ListItemIcon>
            <VpnKey />
          </ListItemIcon>
          <ListItemText
            primary="Export Recovery Phrase / Keys"
            secondary="View and copy your recovery phrase or private keys"
          />
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemIcon>
            <Info />
          </ListItemIcon>
          <ListItemText primary="Version" secondary="0.1.0" />
        </ListItem>

        <Divider />

        <ListItem
          onClick={() => setResetDialogOpen(true)}
          sx={{
            cursor: "pointer",
            "&:hover": { bgcolor: "rgba(248,81,73,0.08)" },
          }}
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

      {/* Reset Dialog */}
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

      {/* Export Keys Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={handleCloseExportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Keys</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          {!exportedKeys ? (
            <>
              {/* ✅ SECURITY FIX: Stronger export warning */}
              <Alert severity="error" sx={{ alignItems: "center" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  ⚠️ CRITICAL SECURITY WARNING
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { mb: 0.5 } }}>
                  <li>Anyone with your private key can <strong>steal ALL your funds</strong></li>
                  <li>NEVER share your keys with anyone</li>
                  <li>NEVER screenshot or save digitally</li>
                  <li>Make sure no one is watching your screen</li>
                  <li>Check for malicious browser extensions</li>
                </Box>
              </Alert>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportConfirmed}
                    onChange={(e) => setExportConfirmed(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    I understand the risks and have taken security precautions
                  </Typography>
                }
              />

              <TextField
                fullWidth
                type="password"
                label="Password"
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && exportConfirmed && handleExportKey()}
                error={!!exportError}
                helperText={exportError}
                disabled={!exportConfirmed}
                autoFocus={exportConfirmed}
              />
            </>
          ) : (
            <>
              <Alert severity="warning" sx={{ mt: 0, alignItems: "center" }}>
                Never share your keys. Anyone with these can access your funds.
              </Alert>

              {exportedKeys.mnemonic &&
                renderKeySection(
                  "Recovery Phrase",
                  exportedKeys.mnemonic,
                  showMnemonic,
                  setShowMnemonic,
                )}

              {exportedKeys.solanaKey &&
                renderKeySection(
                  "Solana Private Key",
                  exportedKeys.solanaKey,
                  showSolanaKey,
                  setShowSolanaKey,
                )}

              {exportedKeys.evmKey &&
                renderKeySection(
                  "EVM Private Key (Ethereum/Base/Arbitrum)",
                  exportedKeys.evmKey,
                  showEvmKey,
                  setShowEvmKey,
                )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{mx: 2, mb: 2}}>
          {exportedKeys && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={handleCopyAll}
            >
              Copy All
            </Button>
          )}
          <Button onClick={handleCloseExportDialog}>Close</Button>
          {!exportedKeys && (
            <Button
              onClick={handleExportKey}
              variant="contained"
              disabled={exportLoading || !exportPassword.trim() || !exportConfirmed}
            >
              {exportLoading ? "Decrypting..." : "Reveal"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Import Missing Chain Key Dialog */}
      <Dialog
        open={!!importChainDialog}
        onClose={handleCloseImportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Import {importChainDialog === "solana" ? "Solana" : "EVM"} Private Key
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Enter your wallet password and the{" "}
            {importChainDialog === "solana" ? "Solana (Base58)" : "EVM (0x hex)"}{" "}
            private key.
          </Typography>

          <TextField
            fullWidth
            type="password"
            label="Wallet Password"
            value={importPassword}
            onChange={(e) => setImportPassword(e.target.value)}
            autoFocus
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label={
              importChainDialog === "solana"
                ? "Solana Private Key (Base58)"
                : "EVM Private Key (0x...)"
            }
            value={importKey}
            onChange={(e) => setImportKey(e.target.value)}
            type="password"
          />

          {importError && <Alert severity="error">{importError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog}>Cancel</Button>
          <Button
            onClick={handleImportChainKey}
            variant="contained"
            disabled={
              importLoading || !importPassword.trim() || !importKey.trim()
            }
          >
            {importLoading ? "Importing..." : "Import"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
