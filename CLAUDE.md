# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev       # Start Next.js dev server (webpack mode)
npm run build     # Next.js production build (webpack mode)
npm run start     # Start production server
npm run lint      # ESLint check
npm run lint:fix  # ESLint auto-fix
```

ESLint 9 with flat config (`eslint.config.js`): typescript-eslint, react-hooks. No test runner or formatter configured.

## Architecture Overview

Client-side Solana wallet app built with Next.js 16 App Router + React 18 + TypeScript. No backend — all crypto operations, storage, and API calls happen in the browser. All components use `'use client'` directive.

### State Management

Zustand store with modular slices (`walletSlice`, `chainSlice`, `uiSlice`, `swapSlice`, `transactionSlice`) combined in `src/store/index.ts`.

### Routing & Guards

Next.js App Router with file-based routing in `app/` directory:
- `src/guards/AuthGuard.tsx` — redirects to `/onboarding` if wallet not initialized
- `src/guards/OnboardingGuard.tsx` — redirects to `/dashboard` if already initialized
- `app/(protected)/` — route group wrapping authenticated pages with AuthGuard + MainLayout
- `app/onboarding/` — wraps with OnboardingGuard + AuthLayout

Routes: `/onboarding`, `/dashboard`, `/send/[tokenMint]?`, `/receive`, `/swap/[inputMint]?/[outputMint]?`, `/history`, `/settings`.

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

- Path alias: `@/` maps to `src/` (configured in `tsconfig.json`)
- Webpack polyfills buffer, process, crypto, stream, util for Solana web3.js compatibility (client-side only, configured in `next.config.js`)
- Solana packages listed in `serverExternalPackages` to avoid SSR issues
- Providers loaded via `next/dynamic` with `ssr: false` in `src/providers/ClientProviders.tsx`
- MUI v5 with custom dark theme (`src/theme/muiTheme.ts`), SCSS for global styles
- Page components live in `src/views/` (not `src/pages/` to avoid Next.js Pages Router conflict)
- `bip39` v3 wordlists may not load in ESM bundler — avoid `validateMnemonic()` without explicitly passing the wordlist; prefer try-catching derivation functions instead
