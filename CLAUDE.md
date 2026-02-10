# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript compile + Vite production build
npm run preview   # Preview production build
npm run lint      # ESLint check
npm run lint:fix  # ESLint auto-fix
```

ESLint 9 with flat config (`eslint.config.js`): typescript-eslint, react-hooks, react-refresh. No test runner or formatter configured.

## Architecture Overview

Client-side Solana wallet app built with React 18 + TypeScript + Vite. No backend — all crypto operations, storage, and API calls happen in the browser.

### State Management

Zustand store with modular slices (`walletSlice`, `chainSlice`, `uiSlice`, `swapSlice`, `transactionSlice`) combined in `src/store/index.ts`.

### Routing & Guards

React Router v6 with two guards in `src/router/routes.tsx`:
- `AuthGuard` — redirects to `/onboarding` if wallet not initialized
- `OnboardingGuard` — redirects to `/dashboard` if already initialized

Routes: `/onboarding`, `/dashboard`, `/send/:tokenMint?`, `/receive`, `/swap/:inputMint?/:outputMint?`, `/history`, `/settings`.

### Chain Provider Architecture

`src/chains/ChainRegistry.ts` registers chain providers implementing `IChainProvider` (defined in `src/types/chain.ts`). Currently only Solana is implemented (`src/chains/solana/`). EVM and TON directories exist as placeholders.

Solana services: `SolanaConnection` (RPC), `SolanaTokenService` (balances), `SolanaSwapService` (Jupiter integration), `SolanaTransactionParser` (history).

### Wallet & Security

- BIP39 mnemonic → BIP44 derivation (`m/44'/501'/0'/0'`) in `src/services/walletGenerator.ts`
- AES-GCM encryption with PBKDF2 (600k iterations) in `src/services/crypto.ts`
- Encrypted keystore in localStorage via `src/services/keystore.ts`
- Three wallet modes: `Generated` (mnemonic), `PrivateKey` (imported), `Extension` (Phantom/Solflare adapter)

### External APIs

- Jupiter Aggregator: swap quotes & execution (`https://quote-api.jup.ag`)
- Jupiter Price API: token prices (`https://price.jup.ag/v6/price`)
- Solana RPC: devnet (default) and mainnet-beta endpoints
- API config in `src/config/env.ts`

## Key Conventions

- Path alias: `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`)
- Vite polyfills buffer, process, crypto, stream, util for Solana web3.js compatibility
- MUI v5 with custom dark theme (`src/theme/muiTheme.ts`), SCSS for global styles
- `bip39` v3 wordlists may not load in Vite's ESM bundler — avoid `validateMnemonic()` without explicitly passing the wordlist; prefer try-catching derivation functions instead
