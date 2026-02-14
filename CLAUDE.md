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

**Important:** Private keys are NOT stored in Zustand state for security. Use `secureKeyManager` instead:
- `walletSlice` stores only public data (addresses, wallet type, mode)
- Private keys managed by `src/services/secureKeyManager.ts` (closure-based storage)
- `swapSlice` has slippage validation (1-500 bps, warns above 100 bps)

### Routing & Guards

Next.js App Router with file-based routing in `app/` directory:
- `src/guards/AuthGuard.tsx` — redirects to `/onboarding` if wallet not initialized
- `src/guards/OnboardingGuard.tsx` — redirects to `/dashboard` if already initialized
- `app/(protected)/` — route group wrapping authenticated pages with AuthGuard + MainLayout
- `app/onboarding/` — wraps with OnboardingGuard + AuthLayout

Routes: `/onboarding`, `/dashboard`, `/send/[tokenMint]?`, `/receive`, `/swap/[inputMint]?/[outputMint]?`, `/history`, `/settings`.

### Chain Provider Architecture

`src/chains/ChainRegistry.ts` registers chain providers implementing `IChainProvider` (defined in `src/types/chain.ts`). Currently only Solana is implemented (`src/chains/solana/`). EVM and TON directories exist as placeholders.

Solana services: `SolanaConnection` (RPC), `SolanaTokenService` (balances), `SolanaSwapService` (Jupiter integration), `SolanaTransactionParser` (history - uses sequential requests to comply with public RPC batch limits).

### Wallet & Security

**Key Management:**
- BIP39 mnemonic → BIP44 derivation (`m/44'/501'/0'/0'`) in `src/services/walletGenerator.ts`
- AES-GCM encryption with PBKDF2 (600k iterations) in `src/services/crypto.ts`
- Encrypted keystore in localStorage via `src/services/keystore.ts`
- Three wallet modes: `Generated` (mnemonic), `PrivateKey` (imported), `Extension` (Phantom/Solflare adapter)

**Security Architecture (Critical):**
- `src/services/secureKeyManager.ts` — **Closure-based key storage**. Private keys stored in closure (NOT Zustand state) to prevent window object exposure. Implements auto-lock after 15 minutes and secure memory zeroing with Uint8Array.
- `src/utils/passwordValidator.ts` — Strong password policy enforcer (12+ chars, complexity requirements, common password check)
- `src/hooks/useLockoutProtection.ts` — Rate limiting with exponential backoff (5 attempts → 5min lock, doubles each time)
- `src/utils/rpcValidator.ts` — HTTPS enforcement for all RPC endpoints to prevent MITM attacks
- `src/components/common/SecurityWarningBanner.tsx` — User warning about browser extension risks
- `src/components/common/LockScreen.tsx` — Unlock screen with rate limiting integration

**Security Features:**
- Private keys NEVER stored in Zustand state (only in secureKeyManager closure)
- **Password confirmation required for every transaction** (send & swap)
- Transaction simulation before signing to detect malicious/failing transactions
- Slippage validation (max 5%) to prevent sandwich attacks
- Timing attack protection with random delays on decryption failures
- CSP headers in production (XSS protection, clickjacking prevention)
- Source maps disabled in production
- Auto-lock after 15 minutes of inactivity
- **Auto-lock on window blur** (locks immediately when switching windows/tabs)
- **Paste address verification** (prevents clipboard hijacking attacks)
- Secure memory zeroing (Uint8Array overwrite with random + fill 0)
- Rate limiting on password attempts (5 attempts, exponential backoff)

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

## Security Guidelines

**CRITICAL: Never store private keys in Zustand state or any window-accessible object.**

When working with private keys:
1. Always use `secureKeyManager.unlockSolana()` / `unlockEvm()` to store keys
2. Retrieve keys only when needed via `secureKeyManager.getKeypair()` / `getEvmSigner()`
3. Never add `secretKey` or `privateKey` fields to Zustand slices
4. Use `Uint8Array` for key material (allows secure zeroing), not strings
5. Lock wallet via `secureKeyManager.lock()` which zeroes memory

**Transaction Security Flow:**
1. User fills transaction form (send/swap)
2. User clicks Send/Swap button
3. ConfirmSendModal shows transaction details
4. User clicks Confirm
5. **PasswordConfirmationDialog appears** (NEW)
6. User enters password
7. Password verified via `loadKeystore()` with rate limiting
8. If correct: transaction executes, password re-verified in hook (defense-in-depth)
9. If incorrect: shows error, remaining attempts, locks after 5 failures

**Components:**
- `PasswordConfirmationDialog` - Reusable password dialog with rate limiting
- `ConfirmSendModal` - Transaction confirmation with password step
- `SwapCard` - Swap execution with password verification
- `SendForm` - Send flow with paste address verification

When adding new features:
- Simulate transactions before signing (`connection.simulateTransaction`)
- Validate all user inputs (amounts, addresses, slippage)
- Use HTTPS for all external API calls (validated in `src/config/env.ts`)
- Add appropriate error handling with timing attack protection (random delays)
- **Require password confirmation for all financial operations**

## Production Deployment

**Build for production:**
```bash
NODE_ENV=production npm run build
NODE_ENV=production npm run start
```

**Security verification:**
```bash
./test-security-headers.sh  # Automated security headers test
```

**Expected security headers in production:**
- `Content-Security-Policy` — XSS protection (only in production, disabled in dev to avoid HMR issues)
- `X-Frame-Options: DENY` — Clickjacking protection
- `X-Content-Type-Options: nosniff` — MIME sniffing protection
- `Referrer-Policy: strict-origin-when-cross-origin` — Privacy
- `Permissions-Policy` — Feature restrictions

**Security documentation:**
- `COMPREHENSIVE_SECURITY_ANALYSIS.md` — Full security audit and remaining risks
- `SECURITY_ATTACK_VECTORS.md` — Attack scenarios and mitigations
- `SECURITY_FOR_USERS.md` — User-facing security guide
- `verify-production.md` — Production deployment verification guide

**Current security score: 8.5/10** (improved from 7/10)
- **NEW:** Transaction password confirmation (every send/swap requires password)
- **NEW:** Auto-lock on window blur (immediate lock when switching windows)
- **NEW:** Paste address verification (prevents clipboard hijacking)
- Remaining risks: browser extensions, phishing, social engineering
- Physical access risk significantly reduced (password always required for transactions)
- These remaining risks require user awareness and cannot be fully mitigated at application level
