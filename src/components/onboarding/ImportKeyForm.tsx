import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { VpnKey } from "@mui/icons-material";
import { importFromPrivateKey } from "@/services/walletGenerator";
import { saveKeystore, saveEvmKeystore } from "@/services/keystore";
import { secureKeyManager } from "@/services/secureKeyManager";
import { useStore } from "@/store";
import { WalletMode, WalletAccount } from "@/types/wallet";
import { ChainId } from "@/types/chain";
import { ethers } from "ethers";

type ChainType = "solana" | "evm";

interface ImportKeyFormProps {
  password: string;
  onSuccess: () => void;
}

export function ImportKeyForm({ password, onSuccess }: ImportKeyFormProps) {
  const [chainType, setChainType] = useState<ChainType>("solana");
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setMode = useStore((s) => s.setMode);
  const addAccount = useStore((s) => s.addAccount);
  const setActiveAccount = useStore((s) => s.setActiveAccount);
  const setInitialized = useStore((s) => s.setInitialized);
  const setLocked = useStore((s) => s.setLocked);
  const setActiveChain = useStore((s) => s.setActiveChain);

  const handleImport = async () => {
    if (!privateKey.trim()) {
      setError("Please enter a private key");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (chainType === "solana") {
        const { publicKey, secretKeyBase58 } = importFromPrivateKey(
          privateKey.trim(),
        );
        await saveKeystore(secretKeyBase58, password);

        const account: WalletAccount = {
          address: publicKey,
          evmAddress: null,
          label: "Imported Wallet",
          mode: WalletMode.PrivateKey,
          createdAt: Date.now(),
        };

        setMode(WalletMode.PrivateKey);
        addAccount(account);
        setActiveAccount(account);

        // ✅ SECURITY FIX: Use secure key manager
        secureKeyManager.unlockSolana(secretKeyBase58);
        secureKeyManager.setLockCallback(() => {
          setLocked(true);
        });

        setInitialized(true);
        setLocked(false);
        onSuccess();
      } else {
        // EVM private key import
        const trimmedKey = privateKey.trim();
        const wallet = new ethers.Wallet(trimmedKey);

        await saveEvmKeystore(trimmedKey, password);

        const account: WalletAccount = {
          address: "",
          evmAddress: wallet.address,
          label: "Imported EVM Wallet",
          mode: WalletMode.PrivateKey,
          createdAt: Date.now(),
        };

        setMode(WalletMode.PrivateKey);
        addAccount(account);
        setActiveAccount(account);

        // ✅ SECURITY FIX: Use secure key manager
        secureKeyManager.unlockEvm(trimmedKey);
        secureKeyManager.setLockCallback(() => {
          setLocked(true);
        });

        setActiveChain(ChainId.Ethereum);
        setInitialized(true);
        setLocked(false);
        onSuccess();
      }
    } catch {
      setError(
        chainType === "solana"
          ? "Invalid private key. Please check and try again."
          : "Invalid EVM private key. Must be a hex string (0x...).",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <VpnKey color="primary" />
        <Typography variant="h6">Import Private Key</Typography>
      </Box>

      <ToggleButtonGroup
        value={chainType}
        exclusive
        onChange={(_, v) => {
          if (v) {
            setChainType(v);
            setPrivateKey("");
            setError("");
          }
        }}
        fullWidth
        size="small"
      >
        <ToggleButton value="solana">Solana</ToggleButton>
        <ToggleButton value="evm">EVM (ETH/Base/Arb)</ToggleButton>
      </ToggleButtonGroup>

      <Alert severity="info">
        {chainType === "solana"
          ? "Importing a Solana private key. You can add an EVM key later in Settings."
          : "Importing an EVM private key. You can add a Solana key later in Settings."}
      </Alert>

      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder={
          chainType === "solana"
            ? "Enter your Base58 private key"
            : "Enter your EVM private key (0x...)"
        }
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        type="password"
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Button
        fullWidth
        variant="contained"
        onClick={handleImport}
        disabled={loading || !privateKey.trim()}
        size="large"
      >
        {loading ? "Importing..." : "Import Wallet"}
      </Button>
    </Box>
  );
}
