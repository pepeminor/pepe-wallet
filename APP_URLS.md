# 🌐 Application URLs

## Production URL

**Live App:** https://pepe-wallet-alpha.vercel.app/

---

## Valid Routes

### Public Routes (No authentication required)

| Route | Description | Example |
|-------|-------------|---------|
| `/onboarding` | Wallet setup flow | https://pepe-wallet-alpha.vercel.app/onboarding |

### Protected Routes (Requires wallet initialization)

| Route | Description | Example |
|-------|-------------|---------|
| `/dashboard` | Main wallet dashboard | https://pepe-wallet-alpha.vercel.app/dashboard |
| `/receive` | Receive tokens page | https://pepe-wallet-alpha.vercel.app/receive |
| `/history` | Transaction history | https://pepe-wallet-alpha.vercel.app/history |
| `/settings` | Wallet settings | https://pepe-wallet-alpha.vercel.app/settings |

### Dynamic Routes

| Route | Description | Example |
|-------|-------------|---------|
| `/send` | Send tokens (all tokens) | https://pepe-wallet-alpha.vercel.app/send |
| `/send/[tokenMint]` | Send specific token | https://pepe-wallet-alpha.vercel.app/send/SOL |
| `/swap` | Token swap page | https://pepe-wallet-alpha.vercel.app/swap |
| `/swap/[inputMint]` | Swap from specific token | https://pepe-wallet-alpha.vercel.app/swap/SOL |
| `/swap/[inputMint]/[outputMint]` | Swap between specific tokens | https://pepe-wallet-alpha.vercel.app/swap/SOL/USDC |

### Special Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/onboarding` or `/dashboard` based on wallet state |
| `/*` (404) | Invalid routes show 404 |

---

## Testing URLs

### Security Headers Testing

After deploying to production, test security headers:

```bash
# Test main page
curl -I https://pepe-wallet-alpha.vercel.app/

# Expected headers:
# Content-Security-Policy: default-src 'self'; ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: camera=(), microphone=(), ...
```

### Online Security Scanners

Test the live app with these tools:

1. **Security Headers:**
   - https://securityheaders.com/?q=https://pepe-wallet-alpha.vercel.app/
   - Expected Grade: B+ to A-

2. **Mozilla Observatory:**
   - https://observatory.mozilla.org/analyze/pepe-wallet-alpha.vercel.app
   - Check for security best practices

3. **SSL Labs:**
   - https://www.ssllabs.com/ssltest/analyze.html?d=pepe-wallet-alpha.vercel.app
   - Vercel should get A+ rating

---

## Route Guards

### AuthGuard
Protected routes (`/dashboard`, `/send`, `/receive`, `/swap`, `/history`, `/settings`) require:
- Wallet initialized in localStorage
- Redirects to `/onboarding` if not initialized

### OnboardingGuard
Onboarding route (`/onboarding`) requires:
- Wallet NOT initialized
- Redirects to `/dashboard` if already initialized

---

## Deployment Info

- **Platform:** Vercel
- **Domain:** pepe-wallet-alpha.vercel.app (Vercel free subdomain)
- **Auto-deploy:** Enabled on `main` branch
- **Environment:** Production (NODE_ENV=production)
- **Security headers:** Enabled automatically in production

---

## Custom Domain (Future)

To add a custom domain:

1. Buy domain (e.g., pepewallet.com)
2. Add to Vercel project settings
3. Update DNS records
4. Update all documentation URLs

---

## Local Development URLs

```bash
# Development mode (no CSP headers)
npm run dev
http://localhost:3000

# Production mode (with CSP headers)
npm run build
npm run start
http://localhost:3000
```

---

## API Endpoints Used

The app connects to these external APIs:

| Service | URL | Purpose |
|---------|-----|---------|
| Solana RPC (Devnet) | https://api.devnet.solana.com | Default network |
| Solana RPC (Mainnet) | https://solana-rpc.publicnode.com | Production network |
| Jupiter Quotes | https://quote-api.jup.ag | Swap quotes |
| Jupiter Price | https://price.jup.ag/v6/price | Token prices |
| CoinGecko | https://api.coingecko.com | Backup price data |

All API connections use HTTPS (enforced in code).

---

## Security Testing

Test that invalid domains are rejected:

```typescript
// These should throw errors:
validateRpcUrl('http://api.solana.com', 'Solana RPC');  // ❌ HTTP
validateRpcUrl('https://evil.com/rpc', 'Solana RPC');   // ⚠️ Not in allowlist
```

Valid domains are configured in `src/config/env.ts` and validated by `src/utils/rpcValidator.ts`.
