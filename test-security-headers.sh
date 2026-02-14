#!/bin/bash

echo "🔒 SECURITY HEADERS VERIFICATION TEST"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check current NODE_ENV
echo "1️⃣ Checking NODE_ENV..."
if [ "$NODE_ENV" = "production" ]; then
    echo -e "${GREEN}✅ NODE_ENV is production${NC}"
else
    echo -e "${YELLOW}⚠️  NODE_ENV is: ${NODE_ENV:-'not set'}${NC}"
    echo "   (This is OK for local testing)"
fi
echo ""

# Test 2: Build the app
echo "2️⃣ Building for production..."
echo "   Look for: 'CSP Enabled: YES ✅'"
echo ""
npm run build 2>&1 | grep -A 3 "Security Headers" || echo -e "${RED}❌ Build failed${NC}"
echo ""

# Test 3: Check if .next exists
if [ -d ".next" ]; then
    echo -e "${GREEN}✅ Production build created (.next folder exists)${NC}"
else
    echo -e "${RED}❌ No production build found${NC}"
    exit 1
fi
echo ""

# Test 4: Start server in background
echo "3️⃣ Starting production server..."
NODE_ENV=production npm run start > /dev/null 2>&1 &
SERVER_PID=$!
echo "   Server PID: $SERVER_PID"

# Wait for server to be ready
echo "   Waiting for server to start..."
sleep 5

# Test 5: Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server not responding${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo ""

# Test 6: Check security headers
echo "4️⃣ Checking Security Headers..."
echo ""

HEADERS=$(curl -sI http://localhost:3000)

# Check CSP
if echo "$HEADERS" | grep -qi "content-security-policy"; then
    echo -e "${GREEN}✅ Content-Security-Policy: FOUND${NC}"
    echo "$HEADERS" | grep -i "content-security-policy" | sed 's/^/   /'
else
    echo -e "${RED}❌ Content-Security-Policy: NOT FOUND${NC}"
    echo -e "${YELLOW}   This means CSP is disabled (dev mode)${NC}"
fi
echo ""

# Check X-Frame-Options
if echo "$HEADERS" | grep -qi "x-frame-options"; then
    echo -e "${GREEN}✅ X-Frame-Options: FOUND${NC}"
    echo "$HEADERS" | grep -i "x-frame-options" | sed 's/^/   /'
else
    echo -e "${RED}❌ X-Frame-Options: NOT FOUND${NC}"
fi
echo ""

# Check X-Content-Type-Options
if echo "$HEADERS" | grep -qi "x-content-type-options"; then
    echo -e "${GREEN}✅ X-Content-Type-Options: FOUND${NC}"
    echo "$HEADERS" | grep -i "x-content-type-options" | sed 's/^/   /'
else
    echo -e "${RED}❌ X-Content-Type-Options: NOT FOUND${NC}"
fi
echo ""

# Check Referrer-Policy
if echo "$HEADERS" | grep -qi "referrer-policy"; then
    echo -e "${GREEN}✅ Referrer-Policy: FOUND${NC}"
    echo "$HEADERS" | grep -i "referrer-policy" | sed 's/^/   /'
else
    echo -e "${RED}❌ Referrer-Policy: NOT FOUND${NC}"
fi
echo ""

# Check Permissions-Policy
if echo "$HEADERS" | grep -qi "permissions-policy"; then
    echo -e "${GREEN}✅ Permissions-Policy: FOUND${NC}"
    echo "$HEADERS" | grep -i "permissions-policy" | sed 's/^/   /'
else
    echo -e "${RED}❌ Permissions-Policy: NOT FOUND${NC}"
fi
echo ""

# Test 7: Stop server
echo "5️⃣ Cleaning up..."
kill $SERVER_PID 2>/dev/null
echo -e "${GREEN}✅ Server stopped${NC}"
echo ""

echo "======================================"
echo "🎉 VERIFICATION COMPLETE!"
echo ""
echo "📝 Next Steps:"
echo "   1. If CSP was found ✅ → Ready for production!"
echo "   2. If CSP not found ⚠️ → Run 'NODE_ENV=production npm run build'"
echo "   3. Deploy to Vercel/Netlify → Headers will be automatic"
echo ""
echo "🔗 Test deployed site with:"
echo "   • https://securityheaders.com"
echo "   • Browser DevTools → Network → Response Headers"
echo ""
